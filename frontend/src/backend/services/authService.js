const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      const err = new Error('Nama, email, dan password wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const err = new Error('Email sudah terdaftar');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      name: name.trim(),
      email,
      password: hashedPassword
    });

    const token = this.generateToken(user._id.toString(), user.email);

    return { user, token };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email dan password wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Email atau password salah');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Email atau password salah');
      err.statusCode = 401;
      throw err;
    }

    const token = this.generateToken(user._id.toString(), user.email);
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    return { user: userProfile, token };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('Pengguna tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'supersecretkey_keuangan_123',
      { expiresIn: '7d' }
    );
  }
}

module.exports = new AuthService();
