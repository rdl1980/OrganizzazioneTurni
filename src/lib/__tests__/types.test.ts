import { formatHours, isValidTime, shiftHours, type ShiftType } from '@/lib/types';

const shift = (start: string, end: string): ShiftType => ({
  id: 's',
  name: 'Shift',
  abbrev: 'S',
  color: '#000000',
  start,
  end,
});

describe('isValidTime', () => {
  it('accepts valid HH:MM values', () => {
    expect(isValidTime('06:00')).toBe(true);
    expect(isValidTime('6:30')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('0:00')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidTime('')).toBe(false);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
    expect(isValidTime('12.30')).toBe(false);
    expect(isValidTime('abc')).toBe(false);
  });
});

describe('shiftHours', () => {
  it('computes a standard day shift', () => {
    expect(shiftHours(shift('06:00', '14:00'))).toBe(8);
    expect(shiftHours(shift('08:00', '20:00'))).toBe(12);
  });

  it('wraps overnight shifts to the next day', () => {
    expect(shiftHours(shift('22:00', '06:00'))).toBe(8);
    expect(shiftHours(shift('23:30', '07:30'))).toBe(8);
  });

  it('treats equal start and end as a 24h wrap', () => {
    expect(shiftHours(shift('08:00', '08:00'))).toBe(24);
  });

  it('returns 0 when times are missing (rest day)', () => {
    expect(shiftHours(shift('', ''))).toBe(0);
    expect(shiftHours(shift('06:00', ''))).toBe(0);
  });

  it('handles half-hour durations', () => {
    expect(shiftHours(shift('09:00', '17:30'))).toBe(8.5);
  });
});

describe('formatHours', () => {
  it('drops the decimal for whole hours and keeps one otherwise', () => {
    expect(formatHours(8)).toBe('8');
    expect(formatHours(8.5)).toBe('8.5');
    expect(formatHours(196)).toBe('196');
  });
});
