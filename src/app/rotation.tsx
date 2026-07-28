import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatternModal } from '@/components/pattern-modal';
import { ShiftPill } from '@/components/shift-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { todayKey } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { RotationPattern } from '@/lib/types';

export default function RotationScreen() {
  const theme = useTheme();
  const { data, applyPattern, deactivatePattern } = useStore();
  const [editing, setEditing] = useState<RotationPattern | 'new' | null>(null);

  const active = data.activePattern;
  const activeName = active
    ? data.patterns.find((p) => p.id === active.patternId)?.name
    : undefined;
  const shiftById = new Map(data.shiftTypes.map((s) => [s.id, s]));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText style={styles.title}>{t('patternsTitle')}</ThemedText>

          {active && activeName && (
            <View style={[styles.activeBanner, { backgroundColor: theme.accentSoft }]}>
              <ThemedText type="small" style={{ color: theme.accent, flex: 1 }}>
                ● {activeName} — {t('activeFrom')} {active.anchor}
              </ThemedText>
              <Pressable onPress={deactivatePattern} hitSlop={8}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {t('deactivate')}
                </ThemedText>
              </Pressable>
            </View>
          )}

          {data.patterns.map((pattern) => {
            const isActive = active?.patternId === pattern.id;
            return (
              <Pressable key={pattern.id} onPress={() => setEditing(pattern)}>
                <ThemedView
                  type="backgroundElement"
                  style={[
                    styles.row,
                    { borderColor: isActive ? theme.accent : theme.border },
                    isActive && { borderWidth: 1.5 },
                  ]}>
                  <View style={styles.rowMain}>
                    <ThemedText type="smallBold">{pattern.name}</ThemedText>
                    <View style={styles.sequencePreview}>
                      {pattern.sequence.map((step, index) => {
                        const shift = step ? shiftById.get(step) : undefined;
                        return shift ? (
                          <ShiftPill key={index} shift={shift} small />
                        ) : (
                          <View
                            key={index}
                            style={[styles.offStep, { borderColor: theme.backgroundSelected }]}>
                            <ThemedText type="small" themeColor="textSecondary">
                              —
                            </ThemedText>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {!isActive && (
                    <Pressable
                      onPress={() => applyPattern(pattern.id, todayKey())}
                      style={({ pressed }) => [
                        styles.applyButton,
                        { borderColor: theme.accent },
                        pressed && { opacity: 0.7 },
                      ]}>
                      <ThemedText type="smallBold" style={{ color: theme.accent }}>
                        {t('apply')}
                      </ThemedText>
                    </Pressable>
                  )}
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
                  + {t('addPattern')}
                </ThemedText>
              </View>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <PatternModal pattern={editing} onClose={() => setEditing(null)} />
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
  activeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  rowMain: {
    flex: 1,
    gap: Spacing.two,
  },
  sequencePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  offStep: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 6,
  },
  applyButton: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  addButton: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
});
