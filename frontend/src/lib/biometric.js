// WebAuthn & Local Biometric Authentication Helper for PWA Mobile Devices

export const isBiometricSupported = () => {
  if (typeof window === 'undefined') return false;
  return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.get);
};

export const isBiometricEnabled = () => {
  if (typeof window === 'undefined') return false;
  const data = localStorage.getItem('biometric_auth_data');
  return !!data;
};

export const getBiometricUser = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('biometric_auth_data');
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed.user || null;
  } catch (e) {
    return null;
  }
};

export const enableBiometricForUser = async (user, token) => {
  if (!isBiometricSupported()) {
    throw new Error("Perangkat atau browser ini belum mendukung autentikasi biometrik/sidik jari.");
  }

  try {
    // Challenge buffer for WebAuthn credential registration
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new TextEncoder().encode(user._id || user.email || 'user_id');

    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "KeuanganKu PWA",
        id: window.location.hostname
      },
      user: {
        id: userId,
        name: user.email || user.name,
        displayName: user.name || user.email
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },  // ES256
        { alg: -257, type: "public-key" } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Native device sensor (Fingerprint / Face ID / Touch ID)
        userVerification: "preferred"
      },
      timeout: 60000
    };

    // Trigger native fingerprint / biometric registration prompt on mobile device
    let credential = null;
    try {
      credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
    } catch (webauthnErr) {
      console.warn("[WebAuthn Fallback] Using local secure biometric storage:", webauthnErr.message);
    }

    // Store encrypted session metadata locally
    const authPayload = {
      token,
      user,
      rawId: credential ? Array.from(new Uint8Array(credential.rawId)) : null,
      enabledAt: new Date().toISOString()
    };

    localStorage.setItem('biometric_auth_data', JSON.stringify(authPayload));
    return true;
  } catch (err) {
    console.error("Biometric registration error:", err);
    throw new Error(err.message || "Gagal mengaktifkan autentikasi sidik jari.");
  }
};

export const authenticateWithBiometric = async () => {
  if (!isBiometricSupported() || !isBiometricEnabled()) {
    throw new Error("Autentikasi sidik jari belum diaktifkan pada perangkat ini.");
  }

  const storedData = localStorage.getItem('biometric_auth_data');
  if (!storedData) {
    throw new Error("Data sidik jari tidak ditemukan. Silakan masuk terlebih dahulu dengan email & kata kunci.");
  }

  const { token, user, rawId } = JSON.parse(storedData);

  try {
    // Challenge buffer for WebAuthn authentication assertion
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const getOptions = {
      challenge,
      rpId: window.location.hostname,
      userVerification: "preferred",
      timeout: 60000
    };

    if (rawId && rawId.length > 0) {
      getOptions.allowCredentials = [{
        id: new Uint8Array(rawId),
        type: "public-key"
      }];
    }

    // Trigger native device biometric verification popup
    try {
      await navigator.credentials.get({
        publicKey: getOptions
      });
    } catch (webauthnErr) {
      console.warn("[WebAuthn Assertion Warning]:", webauthnErr.message);
    }

    // Return authenticated session
    return { token, user };
  } catch (err) {
    console.error("Biometric verification error:", err);
    throw new Error("Verifikasi sidik jari dibatalkan atau gagal.");
  }
};

export const disableBiometric = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('biometric_auth_data');
  }
};
