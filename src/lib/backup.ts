import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { parseBackup } from '@/lib/backup-core';
import type { AppData } from '@/lib/types';

export const canBackup = true;

/** Writes the data as a JSON file and opens the system share sheet. */
export async function exportBackup(data: AppData): Promise<void> {
  const file = new File(Paths.cache, 'shift-calendar-backup.json');
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(data, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
  }
}

export type BackupPick =
  | { status: 'ok'; data: AppData }
  | { status: 'cancelled' }
  | { status: 'invalid' };

/** Lets the user pick a backup file to restore. */
export async function pickBackup(): Promise<BackupPick> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled) return { status: 'cancelled' };
  const file = new File(result.assets[0].uri);
  const data = parseBackup(await file.text());
  return data ? { status: 'ok', data } : { status: 'invalid' };
}
