import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayModal } from '@/components/day-modal';
import { tintOf } from '@/components/shift-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { buildMonthGrid, dateKey, todayKey } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { patternShiftId } from '@/lib/pattern';
import { canShare, shareView } from '@/lib/share-view';
import { useStore } from '@/lib/store';
import { formatHours, shiftHours } from '@/lib/types';

export default function CalendarScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const { data } = useStore();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const exportRef = useRef<View>(null);

  const shareMonth = async () => {
    // The caption is rendered only while capturing, so the shared image is
    // self-describing without duplicating the header on screen.
    setCapturing(true);
    await new Promise((resolve) => setTimeout(resolve, 80));
    try {
      await shareView(exportRef);
    } finally {
      setCapturing(false);
    }
  };

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const today = todayKey();
  const shiftById = useMemo(
    () => new Map(data.shiftTypes.map((s) => [s.id, s])),
    [data.shiftTypes],
  );

  const stats = useMemo(() => {
    const counts = new Map<string, number>();
    let hours = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(year, month, day);
      const assignment = data.assignments[key];
      const shiftId = assignment ? assignment.shiftTypeId : patternShiftId(data, key);
      if (!shiftId) continue;
      counts.set(shiftId, (counts.get(shiftId) ?? 0) + 1);
      const shift = shiftById.get(shiftId);
      if (shift) hours += shiftHours(shift);
    }
    return { counts, hours };
  }, [data, year, month, shiftById]);

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText style={styles.monthTitle}>
              {t('months')[month]}{' '}
              <ThemedText style={[styles.monthTitle, { color: theme.textSecondary }]}>
                {year}
              </ThemedText>
            </ThemedText>
            <View style={styles.headerActions}>
              {!isCurrentMonth && (
                <Pressable
                  onPress={goToday}
                  style={({ pressed }) => [
                    styles.todayChip,
                    { backgroundColor: theme.accentSoft },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    {t('today')}
                  </ThemedText>
                </Pressable>
              )}
              <Pressable
                onPress={() => changeMonth(-1)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.navButton,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">‹</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => changeMonth(1)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.navButton,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">›</ThemedText>
              </Pressable>
            </View>
          </View>

          <View
            ref={exportRef}
            collapsable={false}
            style={[styles.exportArea, { backgroundColor: theme.background }]}>
          {capturing && (
            <ThemedText style={styles.captureTitle}>
              {t('months')[month]} {year}
            </ThemedText>
          )}
          <View style={styles.weekRow}>
            {t('weekdaysShort').map((label) => (
              <View key={label} style={styles.weekdayCell}>
                <ThemedText style={[styles.weekdayLabel, { color: theme.textSecondary }]}>
                  {label.toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </View>

          {weeks.map((week, i) => (
            <View key={i} style={styles.weekRow}>
              {week.map((cell) => {
                const assignment = cell.inMonth ? data.assignments[cell.key] : undefined;
                const shiftId = !cell.inMonth
                  ? null
                  : assignment
                    ? assignment.shiftTypeId
                    : patternShiftId(data, cell.key);
                const shift = shiftId ? shiftById.get(shiftId) : undefined;
                const isToday = cell.key === today && cell.inMonth;
                return (
                  <Pressable
                    key={cell.key}
                    disabled={!cell.inMonth}
                    onPress={() => setSelectedDay(cell.key)}
                    style={({ pressed }) => [
                      styles.dayCell,
                      {
                        backgroundColor: shift
                          ? tintOf(shift.color, isDark)
                          : theme.backgroundElement,
                        borderColor: isToday ? theme.accent : theme.border,
                        borderWidth: isToday ? 2 : StyleSheet.hairlineWidth,
                      },
                      !cell.inMonth && styles.dayCellMuted,
                      pressed && styles.pressed,
                    ]}>
                    {cell.inMonth && (
                      <>
                        <ThemedText
                          style={[
                            styles.dayNumber,
                            { color: isToday ? theme.accent : theme.textSecondary },
                            isToday && styles.dayNumberToday,
                          ]}>
                          {cell.day}
                        </ThemedText>
                        <View style={styles.dayCellBottom}>
                          {shift && (
                            <ThemedText style={[styles.dayAbbrev, { color: theme.text }]}>
                              {shift.abbrev}
                            </ThemedText>
                          )}
                          {assignment?.note && (
                            <View style={[styles.noteDot, { backgroundColor: theme.accent }]} />
                          )}
                        </View>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View
            style={[
              styles.statsCard,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            {data.shiftTypes.map((shift) => {
              const count = stats.counts.get(shift.id) ?? 0;
              if (count === 0) return null;
              const hours = shiftHours(shift) * count;
              return (
                <View key={shift.id} style={styles.statsRow}>
                  <View style={[styles.statsDot, { backgroundColor: shift.color }]} />
                  <ThemedText type="small" style={styles.statsName}>
                    {shift.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ×{count}
                    {hours > 0 && `  ·  ${formatHours(hours)}${t('hoursShort')}`}
                  </ThemedText>
                </View>
              );
            })}
            <View style={[styles.statsDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statsRow}>
              <ThemedText type="smallBold" style={styles.statsName}>
                {t('totalHours')}
              </ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {formatHours(stats.hours)}
                {t('hoursShort')}
              </ThemedText>
            </View>
          </View>
          </View>

          {canShare && (
            <Pressable onPress={shareMonth}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.shareButton,
                    { backgroundColor: theme.accentSoft },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    {t('shareMonth')}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          )}
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
    paddingVertical: Spacing.three,
  },
  monthTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  todayChip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: Spacing.one,
  },
  weekdayLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dayCell: {
    flex: 1,
    minHeight: 64,
    borderRadius: Radius.md,
    padding: Spacing.one,
    paddingTop: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  dayCellMuted: {
    opacity: 0.2,
  },
  dayNumber: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    alignSelf: 'flex-start',
    paddingLeft: 3,
  },
  dayNumberToday: {
    fontWeight: '800',
  },
  dayCellBottom: {
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  dayAbbrev: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Fonts.rounded,
  },
  noteDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statsCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statsName: {
    flex: 1,
  },
  statsDivider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  exportArea: {
    gap: Spacing.two,
  },
  captureTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
  shareButton: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
});
