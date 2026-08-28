const reminderRepository = require('../repositories/reminderRepository');
const walletService = require('./walletService');

class ReminderService {
  async getReminders(userId) {
    return await reminderRepository.findByUserId(userId);
  }

  async createReminder(userId, payload) {
    if (!payload.title || !payload.amount || !payload.dueDate) {
      const err = new Error('Judul pengingat, nominal, dan tanggal jatuh tempo wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    return await reminderRepository.create({
      userId,
      ...payload
    });
  }

  async markAsPaid(id, userId) {
    const reminder = await reminderRepository.findById(id, userId);
    if (!reminder) {
      const err = new Error('Pengingat pembayaran tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (reminder.status === 'PAID') {
      return reminder;
    }

    // Automatically record cash expense if walletId is associated
    if (reminder.walletId) {
      await walletService.recordCashTransaction(userId, {
        walletId: reminder.walletId,
        categoryId: reminder.categoryId,
        type: 'EXPENSE',
        amount: reminder.amount,
        note: `[Pengingat Pembayaran] ${reminder.title}`
      });
    }

    return await reminderRepository.updateStatus(id, userId, 'PAID');
  }

  async deleteReminder(id, userId) {
    const deleted = await reminderRepository.delete(id, userId);
    if (!deleted) {
      const err = new Error('Pengingat pembayaran tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return true;
  }
}

module.exports = new ReminderService();
