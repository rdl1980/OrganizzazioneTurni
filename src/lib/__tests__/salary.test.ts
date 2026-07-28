import { formatMoney, monthSalary } from '@/lib/salary';
import type { AppData } from '@/lib/types';

const data = (overrides: Partial<AppData> = {}): AppData => ({
  shiftTypes: [
    { id: 'm', name: 'Morning', abbrev: 'M', color: '#000', start: '06:00', end: '14:00', rate: 10 },
    { id: 'n', name: 'Night', abbrev: 'N', color: '#000', start: '22:00', end: '06:00', rate: 12 },
    { id: 'r', name: 'Rest', abbrev: 'R', color: '#000', start: '', end: '' },
  ],
  assignments: {},
  patterns: [],
  activePattern: null,
  settings: { reminderEnabled: false, reminderTime: '20:00', sundayExtraPct: 0 },
  ...overrides,
});

describe('monthSalary', () => {
  it('returns null when no shift type has a rate', () => {
    const d = data();
    d.shiftTypes = d.shiftTypes.map((s) => ({ ...s, rate: undefined }));
    expect(monthSalary(d, 2026, 7)).toBeNull();
  });

  it('sums hours × rate for assigned days', () => {
    // 3 Aug 2026 (Mon) morning 8h×10, 4 Aug night 8h×12.
    const d = data({
      assignments: {
        '2026-08-03': { shiftTypeId: 'm' },
        '2026-08-04': { shiftTypeId: 'n' },
      },
    });
    expect(monthSalary(d, 2026, 7)).toBe(80 + 96);
  });

  it('applies the Sunday surcharge', () => {
    // 2 Aug 2026 is a Sunday: 8h × 10 × 1.5.
    const d = data({
      assignments: { '2026-08-02': { shiftTypeId: 'm' } },
    });
    d.settings.sundayExtraPct = 50;
    expect(monthSalary(d, 2026, 7)).toBe(120);
  });

  it('ignores rest days and shifts without a rate', () => {
    const d = data({
      assignments: { '2026-08-03': { shiftTypeId: 'r' } },
    });
    expect(monthSalary(d, 2026, 7)).toBe(0);
  });

  it('counts pattern-derived days too', () => {
    // Every day morning from 1 Aug: 31 days, but 2/9/16/23/30 are Sundays (no surcharge set).
    const d = data({
      patterns: [{ id: 'p', name: 'all-m', sequence: ['m'] }],
      activePattern: { patternId: 'p', anchor: '2026-08-01' },
    });
    expect(monthSalary(d, 2026, 7)).toBe(31 * 8 * 10);
  });
});

describe('formatMoney', () => {
  it('formats with two decimals', () => {
    expect(formatMoney(1234.5)).toBe('€ 1234.50');
  });
});
