import { buildMonthGrid, dateKey, daysBetweenKeys } from '@/lib/dates';

describe('dateKey', () => {
  it('pads month and day to two digits', () => {
    expect(dateKey(2026, 0, 5)).toBe('2026-01-05');
    expect(dateKey(2026, 11, 31)).toBe('2026-12-31');
  });
});

describe('daysBetweenKeys', () => {
  it('counts days across month boundaries', () => {
    expect(daysBetweenKeys('2026-08-01', '2026-08-01')).toBe(0);
    expect(daysBetweenKeys('2026-08-01', '2026-08-09')).toBe(8);
    expect(daysBetweenKeys('2026-07-31', '2026-08-01')).toBe(1);
    expect(daysBetweenKeys('2025-12-31', '2026-01-01')).toBe(1);
  });

  it('is negative when the target precedes the anchor', () => {
    expect(daysBetweenKeys('2026-08-10', '2026-08-01')).toBe(-9);
  });

  it('is unaffected by DST transitions', () => {
    // Europe DST ends 2026-10-25.
    expect(daysBetweenKeys('2026-10-24', '2026-10-26')).toBe(2);
    // Europe DST starts 2026-03-29.
    expect(daysBetweenKeys('2026-03-28', '2026-03-30')).toBe(2);
  });
});

describe('buildMonthGrid', () => {
  it('builds Monday-first weeks covering August 2026', () => {
    // 1 Aug 2026 is a Saturday: 5 leading cells from July, 6 weeks total.
    const weeks = buildMonthGrid(2026, 7);
    expect(weeks).toHaveLength(6);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0]).toEqual({ key: '2026-07-27', day: 27, inMonth: false });
    expect(weeks[0][5]).toEqual({ key: '2026-08-01', day: 1, inMonth: true });
    expect(weeks[5][0]).toEqual({ key: '2026-08-31', day: 31, inMonth: true });
  });

  it('handles a month starting on Monday with no leading cells', () => {
    // 1 Jun 2026 is a Monday.
    const weeks = buildMonthGrid(2026, 5);
    expect(weeks[0][0]).toEqual({ key: '2026-06-01', day: 1, inMonth: true });
    expect(weeks).toHaveLength(5);
  });

  it('handles February in a leap year', () => {
    // Feb 2028: 29 days, 1 Feb is a Tuesday.
    const weeks = buildMonthGrid(2028, 1);
    const inMonth = weeks.flat().filter((c) => c.inMonth);
    expect(inMonth).toHaveLength(29);
    expect(inMonth[28].key).toBe('2028-02-29');
  });
});
