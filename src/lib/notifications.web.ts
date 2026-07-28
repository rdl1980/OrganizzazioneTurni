import type { AppData } from '@/lib/types';

// expo-notifications does not support web; reminders are native-only.

export async function ensurePermissions(): Promise<boolean> {
  return false;
}

export async function syncReminders(_data: AppData): Promise<void> {}
