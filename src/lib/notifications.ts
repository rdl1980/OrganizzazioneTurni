import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { dateKey } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { effectiveShiftId } from '@/lib/pattern';
import type { AppData } from '@/lib/types';

const DAYS_AHEAD = 14;
const CHANNEL_ID = 'shift-reminders';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Local notifications cannot compute content at fire time, so the next
 * DAYS_AHEAD evenings are scheduled with tomorrow's shift and rescheduled on
 * every data change (and on every app start, which refreshes the window).
 */
export async function syncReminders(data: AppData): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!data.settings.reminderEnabled) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: t('reminderSection'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const [hour, minute] = data.settings.reminderTime.split(':').map(Number);
  const now = new Date();
  const shiftById = new Map(data.shiftTypes.map((s) => [s.id, s]));

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const fireDate = new Date(
      now.getFullYear(), now.getMonth(), now.getDate() + i,
      Number.isFinite(hour) ? hour : 20, Number.isFinite(minute) ? minute : 0,
    );
    if (fireDate <= now) continue;

    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
    const key = dateKey(target.getFullYear(), target.getMonth(), target.getDate());
    const shiftId = effectiveShiftId(data, key);
    const shift = shiftId ? shiftById.get(shiftId) : undefined;
    if (!shift) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifTitle'),
        body:
          shift.start && shift.end ? `${shift.name} · ${shift.start}–${shift.end}` : shift.name,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
        channelId: CHANNEL_ID,
      },
    });
  }
}
