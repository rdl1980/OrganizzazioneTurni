import type { AppData } from '@/lib/types';

// Backup relies on the native share sheet and document picker; dev-web skips it.

export const canBackup = false;

export type BackupPick =
  | { status: 'ok'; data: AppData }
  | { status: 'cancelled' }
  | { status: 'invalid' };

export async function exportBackup(_data: AppData): Promise<void> {}

export async function pickBackup(): Promise<BackupPick> {
  return { status: 'cancelled' };
}
