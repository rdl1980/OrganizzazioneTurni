import { daysBetweenKeys } from '@/lib/dates';
import type { AppData } from '@/lib/types';

/** Shift derived from the active rotation pattern for a day, or null. */
export function patternShiftId(data: AppData, key: string): string | null {
  const active = data.activePattern;
  if (!active) return null;
  const pattern = data.patterns.find((p) => p.id === active.patternId);
  if (!pattern || pattern.sequence.length === 0) return null;
  const offset = daysBetweenKeys(active.anchor, key);
  if (offset < 0) return null;
  return pattern.sequence[offset % pattern.sequence.length];
}

/** Explicit assignment if present (even an empty one), else the pattern. */
export function effectiveShiftId(data: AppData, key: string): string | null {
  const assignment = data.assignments[key];
  if (assignment) return assignment.shiftTypeId;
  return patternShiftId(data, key);
}
