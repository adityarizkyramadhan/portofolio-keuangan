// node services/recapService.test.js — cek batas periode (WIB, tz = -420)
const assert = require('assert');
const { periodRange } = require('./recapService');

const now = new Date('2026-10-11T18:30:00Z'); // Senin 12 Okt 2026 01:30 WIB (UTC masih Minggu)
const iso = (r) => [r.start.toISOString(), r.end.toISOString()];

// minggu berjalan mulai Senin 12 Okt 00:00 WIB = 11 Okt 17:00 UTC
assert.deepStrictEqual(iso(periodRange('week', 0, -420, now)), ['2026-10-11T17:00:00.000Z', '2026-10-18T17:00:00.000Z']);
assert.deepStrictEqual(iso(periodRange('week', 1, -420, now)), ['2026-10-04T17:00:00.000Z', '2026-10-11T17:00:00.000Z']);
// bulan, termasuk mundur melewati pergantian tahun
assert.deepStrictEqual(iso(periodRange('month', 0, -420, now)), ['2026-09-30T17:00:00.000Z', '2026-10-31T17:00:00.000Z']);
assert.deepStrictEqual(iso(periodRange('month', 10, -420, now)), ['2025-11-30T17:00:00.000Z', '2025-12-31T17:00:00.000Z']);
assert.deepStrictEqual(iso(periodRange('year', 1, -420, now)), ['2024-12-31T17:00:00.000Z', '2025-12-31T17:00:00.000Z']);
// periode bersambung tanpa celah
for (const mode of ['week', 'month', 'year']) {
  for (let i = 0; i < 30; i++) {
    assert.strictEqual(periodRange(mode, i + 1, -420, now).end.getTime(), periodRange(mode, i, -420, now).start.getTime());
  }
}
console.log('recap periodRange OK');
