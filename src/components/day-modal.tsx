import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ShiftPill, textColorOn } from '@/components/shift-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';

export function DayModal({ dateKey, onClose }: { dateKey: string | null; onClose: () => void }) {
  const theme = useTheme();
  const { data, setDay } = useStore();
  const current = dateKey ? data.assignments[dateKey] : undefined;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    setSelectedId(current?.shiftTypeId ?? null);
    setNote(current?.note ?? '');
  }, [dateKey]);

  if (!dateKey) return null;

  const [year, month, day] = dateKey.split('-').map(Number);
  const title = `${day} ${t('months')[month - 1]} ${year}`;

  const save = () => {
    setDay(dateKey, { shiftTypeId: selectedId, note: note.trim() || undefined });
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.cardWrapper}>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{title}</ThemedText>

            <View style={styles.options}>
              <Pressable
                onPress={() => setSelectedId(null)}
                style={[
                  styles.option,
                  { borderColor: theme.backgroundSelected },
                  selectedId === null && { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText type="small">{t('noShift')}</ThemedText>
              </Pressable>
              {data.shiftTypes.map((shift) => {
                const selected = selectedId === shift.id;
                return (
                  <Pressable
                    key={shift.id}
                    onPress={() => setSelectedId(shift.id)}
                    style={[
                      styles.option,
                      { borderColor: selected ? shift.color : theme.backgroundSelected },
                      selected && { backgroundColor: shift.color },
                    ]}>
                    <ThemedText
                      type="small"
                      style={selected && { color: textColorOn(shift.color) }}>
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
              style={[
                styles.noteInput,
                { color: theme.text, borderColor: theme.backgroundSelected },
              ]}
            />

            <View style={styles.actions}>
              <Pressable onPress={onClose} style={styles.actionButton}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('cancel')}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={save}
                style={[styles.actionButton, styles.saveButton, { backgroundColor: theme.text }]}>
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  {t('save')}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
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
    paddingVertical: Spacing.one,
  },
  noteInput: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
