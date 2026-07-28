import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { textColorOn } from '@/components/shift-pill';
import { ShiftTypeModal } from '@/components/shift-type-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { formatHours, shiftHours, type ShiftType } from '@/lib/types';

export default function ShiftsScreen() {
  const theme = useTheme();
  const { data } = useStore();
  const [editing, setEditing] = useState<ShiftType | 'new' | null>(null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="smallBold" style={styles.title}>
            {t('shiftTypesTitle')}
          </ThemedText>

          {data.shiftTypes.map((shift) => {
            const hours = shiftHours(shift);
            return (
              <Pressable key={shift.id} onPress={() => setEditing(shift)}>
                <ThemedView type="backgroundElement" style={styles.row}>
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
            <View style={[styles.addButton, { borderColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold">+ {t('addShiftType')}</ThemedText>
            </View>
          </Pressable>
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
    fontSize: 18,
    paddingVertical: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    gap: 2,
  },
  addButton: {
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: Spacing.three,
    alignItems: 'center',
  },
});
