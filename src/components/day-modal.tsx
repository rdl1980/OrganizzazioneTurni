import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { textColorOn } from '@/components/shift-pill';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/lib/i18n';
import { effectiveShiftId, patternShiftId } from '@/lib/pattern';
import { useStore } from '@/lib/store';

export function DayModal({ dateKey, onClose }: { dateKey: string | null; onClose: () => void }) {
  const theme = useTheme();
  const { data, setDay } = useStore();
  const current = dateKey ? data.assignments[dateKey] : undefined;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    setSelectedId(dateKey ? effectiveShiftId(data, dateKey) : null);
    setNote(current?.note ?? '');
  }, [dateKey]);

  if (!dateKey) return null;

  const [year, month, day] = dateKey.split('-').map(Number);
  const title = `${day} ${t('months')[month - 1]} ${year}`;

  const save = () => {
    const trimmedNote = note.trim() || undefined;
    // An empty day with no note only needs an explicit entry when it must
    // override the active pattern; otherwise remove the entry entirely.
    if (selectedId === null && !trimmedNote && patternShiftId(data, dateKey) === null) {
      setDay(dateKey, null);
    } else {
      setDay(dateKey, { shiftTypeId: selectedId, note: trimmedNote });
    }
    onClose();
  };

  return (
    <ModalSheet onClose={onClose}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={styles.options}>
        <Pressable
          onPress={() => setSelectedId(null)}
          style={({ pressed }) => [
            styles.option,
            { borderColor: theme.border },
            selectedId === null && { backgroundColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="small">{t('noShift')}</ThemedText>
        </Pressable>
        {data.shiftTypes.map((shift) => {
          const selected = selectedId === shift.id;
          return (
            <Pressable
              key={shift.id}
              onPress={() => setSelectedId(shift.id)}
              style={({ pressed }) => [
                styles.option,
                { borderColor: selected ? shift.color : theme.border },
                selected && { backgroundColor: shift.color },
                pressed && styles.pressed,
              ]}>
              <ThemedText
                type="small"
                style={selected ? { color: textColorOn(shift.color), fontWeight: '700' } : undefined}>
                {shift.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder={t('notePlaceholder')}
        placeholderTextColor={theme.textSecondary}
        style={[styles.noteInput, { color: theme.text, borderColor: theme.border }]}
      />

      <View style={styles.actions}>
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  noteInput: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
