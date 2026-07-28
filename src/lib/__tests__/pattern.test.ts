import { effectiveShiftId, patternShiftId } from '@/lib/pattern';
import type { AppData } from '@/lib/types';

const base: AppData = {
  shiftTypes: [],
  assignments: {},
  patterns: [
    { id: 'p1', name: '2-2-2-2', sequence: ['m', 'm', 'p', 'p', 'n', 'n', null, null] },
  ],
  activePattern: { patternId: 'p1', anchor: '2026-08-01' },
  settings: { reminderEnabled: false, reminderTime: '20:00', sundayExtraPct: 0 },
};

describe('patternShiftId', () => {
  it('derives the cycle from the anchor date', () => {
    expect(patternShiftId(base, '2026-08-01')).toBe('m');
    expect(patternShiftId(base, '2026-08-02')).toBe('m');
    expect(patternShiftId(base, '2026-08-03')).toBe('p');
    expect(patternShiftId(base, '2026-08-05')).toBe('n');
    expect(patternShiftId(base, '2026-08-07')).toBeNull();
    expect(patternShiftId(base, '2026-08-08')).toBeNull();
  });

  it('repeats the cycle indefinitely, across months', () => {
    expect(patternShiftId(base, '2026-08-09')).toBe('m'); // offset 8 % 8 = 0
    expect(patternShiftId(base, '2026-09-02')).toBe('m'); // offset 32 % 8 = 0
    expect(patternShiftId(base, '2027-01-15')).toBeNull(); // offset 167 % 8 = 7
  });

  it('returns null before the anchor', () => {
    expect(patternShiftId(base, '2026-07-31')).toBeNull();
    expect(patternShiftId(base, '2025-01-01')).toBeNull();
  });

  it('returns null with no active pattern, unknown pattern, or empty sequence', () => {
    expect(patternShiftId({ ...base, activePattern: null }, '2026-08-01')).toBeNull();
    expect(
      patternShiftId({ ...base, activePattern: { patternId: 'nope', anchor: '2026-08-01' } }, '2026-08-01'),
    ).toBeNull();
    expect(
      patternShiftId(
        { ...base, patterns: [{ id: 'p1', name: 'x', sequence: [] }] },
        '2026-08-01',
      ),
    ).toBeNull();
  });
});

describe('effectiveShiftId', () => {
  it('lets an explicit assignment override the pattern', () => {
    const data = { ...base, assignments: { '2026-08-05': { shiftTypeId: 'g' } } };
    expect(effectiveShiftId(data, '2026-08-05')).toBe('g');
    expect(effectiveShiftId(data, '2026-08-06')).toBe('n');
  });

  it('lets an explicit empty assignment blank out a pattern day', () => {
    const data = { ...base, assignments: { '2026-08-01': { shiftTypeId: null } } };
    expect(effectiveShiftId(data, '2026-08-01')).toBeNull();
  });

  it('falls back to the pattern when there is no assignment', () => {
    expect(effectiveShiftId(base, '2026-08-03')).toBe('p');
  });
});
