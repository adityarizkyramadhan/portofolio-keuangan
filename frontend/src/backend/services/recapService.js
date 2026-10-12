const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const walletRepository = require('../repositories/walletRepository');
const categoryRepository = require('../repositories/categoryRepository');

const MODES = ['week', 'month', 'year'];

// Batas periode ke-`back` (0 = periode berjalan) sebagai timestamp UTC.
// tzOffset = Date#getTimezoneOffset() milik user (WIB = -420), supaya batas minggu/bulan ikut jam lokal.
function periodRange(mode, back, tzOffset, now = new Date()) {
  const shift = tzOffset * 60000;
  const local = new Date(now.getTime() - shift); // field UTC = jam lokal user
  let y = local.getUTCFullYear();
  let m = local.getUTCMonth();
  let d = local.getUTCDate();
  let start;
  let end;

  if (mode === 'year') {
    start = Date.UTC(y - back, 0, 1);
    end = Date.UTC(y - back + 1, 0, 1);
  } else if (mode === 'month') {
    start = Date.UTC(y, m - back, 1);
    end = Date.UTC(y, m - back + 1, 1);
  } else {
    const monday = d - ((local.getUTCDay() + 6) % 7) - back * 7; // minggu = Senin 00:00 s/d Senin berikutnya
    start = Date.UTC(y, m, monday);
    end = Date.UTC(y, m, monday + 7);
  }
  return { start: new Date(start + shift), end: new Date(end + shift) };
}

class RecapService {
  async getExpenseRecap(userId, { mode = 'month', page = 1, limit = 6, tzOffset = -420 } = {}) {
    if (!MODES.includes(mode)) {
      const err = new Error(`mode harus salah satu dari: ${MODES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(24, Math.max(1, parseInt(limit, 10) || 6));
    tzOffset = Math.min(840, Math.max(-840, Number(tzOffset) || 0));

    // Ambil limit + 1 periode: yang terakhir hanya sebagai pembanding periode tertua di halaman ini
    const now = new Date();
    const firstBack = (page - 1) * limit;
    const ranges = Array.from({ length: limit + 1 }, (_, i) => periodRange(mode, firstBack + i, tzOffset, now));
    const rangeStart = ranges[ranges.length - 1].start;
    const pageStart = ranges[limit - 1].start;

    const [wallets, categories] = await Promise.all([
      walletRepository.findByUserId(userId),
      categoryRepository.findByUserId(userId)
    ]);
    // ponytail: akun valas dilewati karena kurs historis tidak disimpan
    const idrWallets = new Set(wallets.filter((w) => !w.currency || w.currency === 'IDR').map((w) => w._id.toString()));
    const categoryNames = new Map(categories.map((c) => [c._id.toString(), c.name]));

    const col = getDb().collection('cash_transactions');
    const uid = new ObjectId(userId);
    const [transactions, older] = await Promise.all([
      col.find({
        userId: uid,
        type: { $in: ['INCOME', 'EXPENSE'] },
        date: { $gte: rangeStart, $lt: ranges[0].end }
      }).toArray(),
      col.findOne({ userId: uid, type: { $in: ['INCOME', 'EXPENSE'] }, date: { $lt: pageStart } }, { projection: { _id: 1 } })
    ]);

    const buckets = ranges.map((r) => ({ ...r, expense: 0, income: 0, count: 0, byCategory: {} }));
    for (const tx of transactions) {
      if (!idrWallets.has(tx.accountId?.toString())) continue;
      const t = new Date(tx.date).getTime();
      const b = buckets.find((x) => t >= x.start.getTime() && t < x.end.getTime());
      if (!b) continue;
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') {
        b.income += amount;
        continue;
      }
      b.expense += amount;
      b.count += 1;
      const name = categoryNames.get(tx.categoryId?.toString()) || 'Lainnya';
      b.byCategory[name] = (b.byCategory[name] || 0) + amount;
    }

    const periods = buckets.slice(0, limit).map((b, i) => ({
      start: b.start,
      end: b.end,
      expense: b.expense,
      income: b.income,
      count: b.count,
      prevExpense: buckets[i + 1].expense,
      categories: Object.entries(b.byCategory)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b2) => b2.amount - a.amount)
    }));

    return { mode, page, limit, hasMore: Boolean(older), periods };
  }
}

module.exports = new RecapService();
module.exports.periodRange = periodRange;
