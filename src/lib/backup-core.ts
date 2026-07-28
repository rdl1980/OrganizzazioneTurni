import type { AppData } from '@/lib/types';

const DEFAULT_SETTINGS = { reminderEnabled: false, reminderTime: '20:00', sundayExtraPct: 0 };

/**
 * Validates a parsed backup and fills any fields missing from older backups.
 * Returns null when the payload is not a plausible backup.
 */
export function normalizeBackup(raw: unknown): AppData | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const d = raw as Partial<AppData>;

  if (!Array.isArray(d.shiftTypes)) return null;
  if (typeof d.assignments !== 'object' || d.assignments === null) return null;
  const validShifts = d.shiftTypes.every(
    (s) => s && typeof s.id === 'string' && typeof s.name === 'string',
  );
  if (!validShifts) return null;

  return {
    shiftTypes: d.shiftTypes,
    assignments: d.assignments,
    patterns: Array.isArray(d.patterns) ? d.patterns : [],
    activePattern: d.activePattern ?? null,
    settings: { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) },
  };
}

export function parseBackup(json: string): AppData | null {
  try {
    return normalizeBackup(JSON.parse(json));
  } catch {
    return null;
  }
}
