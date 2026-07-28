export type DayCell = {
  key: string;
  day: number;
  inMonth: boolean;
};

export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayKey(): string {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysBetweenKeys(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

/** Monday-first weeks covering the given month; out-of-month cells are marked. */
export function buildMonthGrid(year: number, month: number): DayCell[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

  const cells: DayCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - leading;
    const date = new Date(year, month, 1 + dayOffset);
    cells.push({
      key: dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: dayOffset >= 0 && dayOffset < daysInMonth,
    });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
