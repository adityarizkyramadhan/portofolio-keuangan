const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  async request(method, endpoint, body = null) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server Backend mengembalikan respon non-JSON (Status ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan pada server');
      }
      return data;
    } catch (error) {
      console.warn(`[API Client] ${method} ${endpoint} warning:`, error.message);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const res = await this.request('POST', '/auth/login', { email, password });
    if (res.data && res.data.token) this.setToken(res.data.token);
    return res;
  }

  async register(name, email, password) {
    const res = await this.request('POST', '/auth/register', { name, email, password });
    if (res.data && res.data.token) this.setToken(res.data.token);
    return res;
  }

  async getProfile() {
    return await this.request('GET', '/auth/me');
  }

  // Categories
  async getCategories() {
    return await this.request('GET', '/categories');
  }

  async createCategory(name, type, icon) {
    return await this.request('POST', '/categories', { name, type, icon });
  }

  async deleteCategory(id) {
    return await this.request('DELETE', `/categories/${id}`);
  }

  async updateCategoryLimit(id, budgetLimit) {
    return await this.request('PUT', `/categories/${id}/limit`, { budgetLimit });
  }

  // Wallets & Cash
  async getWallets() {
    return await this.request('GET', '/wallets');
  }

  async createWallet(payload) {
    return await this.request('POST', '/wallets', payload);
  }

  async deleteWallet(id) {
    return await this.request('DELETE', `/wallets/${id}`);
  }

  async recordWalletTransaction(payload) {
    return await this.request('POST', '/wallets/transaction', payload);
  }

  async transferWallets(payload) {
    return await this.request('POST', '/wallets/transfer', payload);
  }

  async getTransactions(limit = 100) {
    return await this.request('GET', `/wallets/transactions?limit=${limit}`);
  }

  // Portfolio
  async getPortfolioAssets() {
    return await this.request('GET', '/portfolio');
  }

  async createAsset(payload) {
    return await this.request('POST', '/portfolio/asset', payload);
  }

  async buyOrSellAsset(payload) {
    return await this.request('POST', '/portfolio/buy-sell', payload);
  }

  async overrideAssetValue(assetId, newTotalValue) {
    return await this.request('PUT', `/portfolio/asset/${assetId}/value`, { newTotalValue });
  }

  // Dashboard
  async getDashboard(year = null, month = null) {
    let url = '/dashboard';
    if (year && month) {
      url += `?year=${year}&month=${month}`;
    }
    return await this.request('GET', url);
  }

  // Payment Reminders
  async getReminders() {
    return await this.request('GET', '/reminders');
  }

  async createReminder(payload) {
    return await this.request('POST', '/reminders', payload);
  }

  async markReminderPaid(id) {
    return await this.request('PUT', `/reminders/${id}/pay`);
  }

  async deleteReminder(id) {
    return await this.request('DELETE', `/reminders/${id}`);
  }
}

export const api = new ApiClient();
