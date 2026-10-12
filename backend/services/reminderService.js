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

    // Catat pembayaran otomatis jika pengingat terhubung ke akun (satu-satunya tempat pencatatan, frontend tidak mencatat lagi)
    const note = `[Pengingat Pembayaran] ${reminder.title}`;
    if (reminder.walletId && reminder.destinationWalletId) {
      await walletService.transfer(userId, {
        sourceWalletId: reminder.walletId.toString(),
        destinationWalletId: reminder.destinationWalletId.toString(),
        amount: reminder.amount,
        note
      });
    } else if (reminder.walletId) {
      await walletService.recordTransaction(userId, {
        walletId: reminder.walletId.toString(),
        categoryId: reminder.categoryId,
        type: 'EXPENSE',
        amount: reminder.amount,
        note
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
