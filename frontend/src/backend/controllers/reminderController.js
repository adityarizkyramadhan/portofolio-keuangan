const reminderService = require('../services/reminderService');

class ReminderController {
  async getAll(req, res, next) {
    try {
      const reminders = await reminderService.getReminders(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar pengingat pembayaran',
        data: reminders
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const reminder = await reminderService.createReminder(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Pengingat pembayaran berhasil dibuat',
        data: reminder
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsPaid(req, res, next) {
    try {
      const reminder = await reminderService.markAsPaid(req.params.id, req.userId);
      res.status(200).json({
        success: true,
        message: 'Pengingat pembayaran berhasil ditandai lunas',
        data: reminder
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await reminderService.deleteReminder(req.params.id, req.userId);
      res.status(200).json({
        success: true,
        message: 'Pengingat pembayaran berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReminderController();
