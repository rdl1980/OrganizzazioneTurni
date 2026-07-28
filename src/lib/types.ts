/** Times are "HH:MM" strings; empty string means no working hours (e.g. rest day). */
export type ShiftType = {
  id: string;
  name: string;
  abbrev: string;
  color: string;
  start: string;
  end: string;
};

export type DayAssignment = {
  shiftTypeId: string | null;
  note?: string;
};

/** Steps are shift type ids; null is a day off. */
export type RotationPattern = {
  id: string;
  name: string;
  sequence: (string | null)[];
};

export type Settings = {
  /** Evening reminder with tomorrow's shift. */
  reminderEnabled: boolean;
  reminderTime: string;
};

/**
 * Assignments are keyed by "YYYY-MM-DD". The active pattern derives shifts for
 * every day from its anchor onward; explicit assignments override it per day.
 */
export type AppData = {
  shiftTypes: ShiftType[];
  assignments: Record<string, DayAssignment>;
  patterns: RotationPattern[];
  activePattern: { patternId: string; anchor: string } | null;
  settings: Settings;
};

const TIME_RE = /^(\d{1,2}):(\d{2})$/;

export function isValidTime(value: string): boolean {
  const m = TIME_RE.exec(value);
  if (!m) return false;
  return Number(m[1]) < 24 && Number(m[2]) < 60;
}

function toMinutes(value: string): number | null {
  const m = TIME_RE.exec(value);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Shift duration in hours; overnight shifts (end <= start) wrap to the next day. */
export function shiftHours(shift: ShiftType): number {
  const start = toMinutes(shift.start);
  const end = toMinutes(shift.end);
  if (start === null || end === null) return 0;
  const diff = end > start ? end - start : end + 24 * 60 - start;
  return diff / 60;
}

export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}
