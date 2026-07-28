import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayModal } from '@/components/day-modal';
import { ShiftPill } from '@/components/shift-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildMonthGrid, todayKey } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { formatHours, shiftHours } from '@/lib/types';

export default function CalendarScreen() {
  const theme = useTheme();
  const { data } = useStore();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const today = todayKey();
  const shiftById = useMemo(
    () => new Map(data.shiftTypes.map((s) => [s.id, s])),
    [data.shiftTypes],
  );

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const stats = useMemo(() => {
    const counts = new Map<string, number>();
    let hours = 0;
    for (const [key, assignment] of Object.entries(data.assignments)) {
      if (!key.startsWith(monthPrefix) || !assignment.shiftTypeId) continue;
      counts.set(assignment.shiftTypeId, (counts.get(assignment.shiftTypeId) ?? 0) + 1);
      const shift = shiftById.get(assignment.shiftTypeId);
      if (shift) hours += shiftHours(shift);
    }
    return { counts, hours };
  }, [data.assignments, monthPrefix, shiftById]);

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable onPress={() => changeMonth(-1)} style={styles.navButton} hitSlop={8}>
              <ThemedText type="subtitle">‹</ThemedText>
            </Pressable>
            <Pressable onPress={goToday}>
              <ThemedText type="smallBold" style={styles.monthTitle}>
                {t('months')[month]} {year}
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => changeMonth(1)} style={styles.navButton} hitSlop={8}>
              <ThemedText type="subtitle">›</ThemedText>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {t('weekdaysShort').map((label) => (
              <View key={label} style={styles.weekdayCell}>
                <ThemedText type="small" themeColor="textSecondary">
                  {label}
                </ThemedText>
              </View>
            ))}
          </View>

          {weeks.map((week, i) => (
            <View key={i} style={styles.weekRow}>
              {week.map((cell) => {
                const assignment = cell.inMonth ? data.assignments[cell.key] : undefined;
                const shift = assignment?.shiftTypeId
                  ? shiftById.get(assignment.shiftTypeId)
                  : undefined;
                const isToday = cell.key === today;
                return (
                  <Pressable
                    key={cell.key}
                    disabled={!cell.inMonth}
                    onPress={() => setSelectedDay(cell.key)}
                    style={[
                      styles.dayCell,
                      { backgroundColor: theme.backgroundElement },
                      !cell.inMonth && styles.dayCellMuted,
                      isToday && { borderColor: theme.text, borderWidth: 2 },
                    ]}>
                    {cell.inMonth && (
                      <>
                        <ThemedText type="small" themeColor={isToday ? 'text' : 'textSecondary'}>
                          {cell.day}
                        </ThemedText>
                        <View style={styles.dayCellBottom}>
                          {shift && <ShiftPill shift={shift} small />}
                          {assignment?.note && (
                            <View style={[styles.noteDot, { backgroundColor: theme.textSecondary }]} />
                          )}
                        </View>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          <ThemedView type="backgroundElement" style={styles.statsCard}>
            {data.shiftTypes.map((shift) => {
              const count = stats.counts.get(shift.id) ?? 0;
              if (count === 0) return null;
              return (
                <View key={shift.id} style={styles.statsRow}>
                  <ShiftPill shift={shift} small />
                  <ThemedText type="small" themeColor="textSecondary">
                    ×{count}
                  </ThemedText>
                </View>
              );
            })}
            <ThemedText type="smallBold" style={styles.statsTotal}>
              {t('totalHours')}: {formatHours(stats.hours)}
              {t('hoursShort')}
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      <DayModal dateKey={selectedDay} onClose={() => setSelectedDay(null)} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  navButton: {
    paddingHorizontal: Spacing.three,
  },
  monthTitle: {
    fontSize: 18,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayCell: {
    flex: 1,
    minHeight: 64,
    borderRadius: Spacing.two,
    padding: Spacing.one,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  dayCellMuted: {
    opacity: 0.25,
  },
  dayCellBottom: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 2,
  },
  noteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statsCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
  },
  statsTotal: {
    marginTop: Spacing.one,
  },
});
