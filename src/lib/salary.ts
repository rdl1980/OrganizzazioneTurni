import { dateKey } from '@/lib/dates';
import { effectiveShiftId } from '@/lib/pattern';
import { shiftHours, type AppData } from '@/lib/types';

/**
 * Estimated gross pay for a month, from per-shift hourly rates and the Sunday
 * surcharge. Null when no shift type has a rate (feature not in use).
 */
export function monthSalary(data: AppData, year: number, month: number): number | null {
  if (!data.shiftTypes.some((s) => (s.rate ?? 0) > 0)) return null;

  const shiftById = new Map(data.shiftTypes.map((s) => [s.id, s]));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const shiftId = effectiveShiftId(data, dateKey(year, month, day));
    const shift = shiftId ? shiftById.get(shiftId) : undefined;
    if (!shift?.rate) continue;
    const isSunday = new Date(year, month, day).getDay() === 0;
    const multiplier = isSunday ? 1 + (data.settings.sundayExtraPct || 0) / 100 : 1;
    total += shiftHours(shift) * shift.rate * multiplier;
  }
  return total;
}

export function formatMoney(amount: number): string {
  return `€ ${amount.toFixed(2)}`;
}
