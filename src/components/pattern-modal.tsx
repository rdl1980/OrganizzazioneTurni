import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { ShiftPill, textColorOn } from '@/components/shift-pill';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { todayKey } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { newId, useStore } from '@/lib/store';
import type { RotationPattern } from '@/lib/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** `pattern` is an existing pattern to edit, 'new' to create, or null when hidden. */
export function PatternModal({
  pattern,
  onClose,
}: {
  pattern: RotationPattern | 'new' | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { data, upsertPattern, deletePattern, applyPattern } = useStore();
  const editing = pattern !== null && pattern !== 'new' ? pattern : null;

  const [name, setName] = useState('');
  const [sequence, setSequence] = useState<(string | null)[]>([]);
  const [anchor, setAnchor] = useState(todayKey());

  useEffect(() => {
    setName(editing?.name ?? '');
    setSequence(editing?.sequence ?? []);
    const active = data.activePattern;
    setAnchor(active && active.patternId === editing?.id ? active.anchor : todayKey());
  }, [pattern]);

  if (pattern === null) return null;

  const shiftById = new Map(data.shiftTypes.map((s) => [s.id, s]));

  const buildPattern = (): RotationPattern | null => {
    const trimmed = name.trim();
    if (!trimmed || sequence.length === 0) return null;
    return { id: editing?.id ?? newId(), name: trimmed, sequence };
  };

  const save = () => {
    const built = buildPattern();
    if (!built) return;
    upsertPattern(built);
    onClose();
  };

  const saveAndApply = () => {
    const built = buildPattern();
    if (!built || !DATE_RE.test(anchor.trim())) return;
    upsertPattern(built);
    applyPattern(built.id, anchor.trim());
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    const doDelete = () => {
      deletePattern(editing.id);
      onClose();
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`${t('deletePatternTitle')} ${t('deletePatternMessage')}`)) doDelete();
    } else {
      Alert.alert(t('deletePatternTitle'), t('deletePatternMessage'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.border }];

  return (
    <ModalSheet onClose={onClose}>
            <ThemedText style={styles.title}>
              {editing ? t('editPattern') : t('addPattern')}
            </ThemedText>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('name')}
              placeholderTextColor={theme.textSecondary}
              style={inputStyle}
            />

            <ThemedText type="small" themeColor="textSecondary">
              {t('sequenceHint')}
            </ThemedText>

            <View style={styles.chips}>
              {data.shiftTypes.map((shift) => (
                <Pressable key={shift.id} onPress={() => setSequence((s) => [...s, shift.id])}>
                  <ShiftPill shift={shift} />
                </Pressable>
              ))}
              <Pressable
                onPress={() => setSequence((s) => [...s, null])}
                style={[styles.offChip, { borderColor: theme.border }]}>
                <ThemedText type="small">{t('dayOff')}</ThemedText>
              </Pressable>
            </View>

            <View style={[styles.sequenceBox, { borderColor: theme.border }]}>
              {sequence.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('emptySequence')}
                </ThemedText>
              ) : (
                sequence.map((step, index) => {
                  const shift = step ? shiftById.get(step) : undefined;
                  return (
                    <Pressable
                      key={`${index}-${step ?? 'off'}`}
                      onPress={() => setSequence((s) => s.filter((_, i) => i !== index))}
                      style={[
                        styles.step,
                        { backgroundColor: shift?.color ?? theme.backgroundSelected },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={shift && { color: textColorOn(shift.color) }}>
                        {shift?.abbrev ?? '—'}
                      </ThemedText>
                    </Pressable>
                  );
                })
              )}
            </View>

            <View style={styles.row}>
              <TextInput
                value={anchor}
                onChangeText={setAnchor}
                placeholder={t('applyFrom')}
                placeholderTextColor={theme.textSecondary}
                style={[...inputStyle, styles.rowItem]}
              />
              <Pressable
                onPress={saveAndApply}
                style={({ pressed }) => [
                  styles.applyButton,
                  { borderColor: theme.accent },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {t('apply')}
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.actions}>
              {editing && (
                <Pressable onPress={remove} style={styles.actionButton}>
                  <ThemedText type="small" style={{ color: theme.danger }}>
                    {t('delete')}
                  </ThemedText>
                </Pressable>
              )}
              <View style={styles.actionsRight}>
                <Pressable onPress={onClose} style={styles.actionButton}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('cancel')}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={save}
                  style={({ pressed }) => [
                    styles.saveButton,
                    { backgroundColor: theme.accent },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                    {t('save')}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  pressed: {
    opacity: 0.7,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    alignItems: 'center',
  },
  offChip: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sequenceBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Spacing.two,
    padding: Spacing.two,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    minHeight: 44,
    alignItems: 'center',
  },
  step: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  rowItem: {
    flex: 1,
  },
  applyButton: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: Spacing.five,
  },
});
