const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const profile = await authService.getProfile(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil profil user',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
