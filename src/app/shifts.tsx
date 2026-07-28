import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { textColorOn } from '@/components/shift-pill';
import { ShiftTypeModal } from '@/components/shift-type-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/lib/i18n';
import { ensurePermissions } from '@/lib/notifications';
import { useStore } from '@/lib/store';
import { formatHours, isValidTime, shiftHours, type ShiftType } from '@/lib/types';

export default function ShiftsScreen() {
  const theme = useTheme();
  const { data, setSettings } = useStore();
  const [editing, setEditing] = useState<ShiftType | 'new' | null>(null);
  const [timeDraft, setTimeDraft] = useState(data.settings.reminderTime);

  const toggleReminder = async (enabled: boolean) => {
    if (enabled && !(await ensurePermissions()) && Platform.OS !== 'web') return;
    setSettings({ reminderEnabled: enabled });
  };

  const commitTime = () => {
    if (isValidTime(timeDraft.trim())) {
      setSettings({ reminderTime: timeDraft.trim() });
    } else {
      setTimeDraft(data.settings.reminderTime);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText style={styles.title}>{t('shiftTypesTitle')}</ThemedText>

          {data.shiftTypes.map((shift) => {
            const hours = shiftHours(shift);
            return (
              <Pressable key={shift.id} onPress={() => setEditing(shift)}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.row, { borderColor: theme.border }]}>
                  <View style={[styles.swatch, { backgroundColor: shift.color }]}>
                    <ThemedText type="smallBold" style={{ color: textColorOn(shift.color) }}>
                      {shift.abbrev}
                    </ThemedText>
                  </View>
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold">{shift.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {shift.start && shift.end
                        ? `${shift.start} – ${shift.end} · ${formatHours(hours)}${t('hoursShort')}`
                        : '—'}
                    </ThemedText>
                  </View>
                </ThemedView>
              </Pressable>
            );
          })}

          <Pressable onPress={() => setEditing('new')}>
            {({ pressed }) => (
              <View
                style={[
                  styles.addButton,
                  { backgroundColor: theme.accentSoft },
                  pressed && { opacity: 0.7 },
                ]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  + {t('addShiftType')}
                </ThemedText>
              </View>
            )}
          </Pressable>

          <ThemedText style={styles.title}>{t('reminderSection')}</ThemedText>
          <ThemedView
            type="backgroundElement"
            style={[styles.reminderCard, { borderColor: theme.border }]}>
            <View style={styles.reminderRow}>
              <ThemedText type="small" style={styles.reminderLabel}>
                {t('reminderToggle')}
              </ThemedText>
              <Switch
                value={data.settings.reminderEnabled}
                onValueChange={toggleReminder}
                trackColor={{ true: theme.accent }}
              />
            </View>
            {data.settings.reminderEnabled && (
              <View style={styles.reminderRow}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.reminderLabel}>
                  {t('reminderTimeLabel')}
                </ThemedText>
                <TextInput
                  value={timeDraft}
                  onChangeText={setTimeDraft}
                  onBlur={commitTime}
                  onSubmitEditing={commitTime}
                  placeholder="20:00"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
                />
              </View>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      <ShiftTypeModal shift={editing} onClose={() => setEditing(null)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'web' ? 88 : 0,
  },
  scrollContent: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    gap: 2,
  },
  addButton: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  reminderCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  reminderLabel: {
    flex: 1,
  },
  timeInput: {
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: 15,
    minWidth: 76,
    textAlign: 'center',
  },
});
