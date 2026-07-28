import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/lib/i18n';
import { newId, useStore } from '@/lib/store';
import { isValidTime, type ShiftType } from '@/lib/types';

const PALETTE = [
  '#F5B940', '#F08036', '#E5484D', '#D6409F', '#8E4EC6', '#5B5BD6',
  '#3B82F6', '#0EA5E9', '#12A594', '#30A46C', '#8DB654', '#8D8D8D',
];

/** `shift` is an existing type to edit, 'new' to create, or null when hidden. */
export function ShiftTypeModal({
  shift,
  onClose,
}: {
  shift: ShiftType | 'new' | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { upsertShiftType, deleteShiftType } = useStore();
  const editing = shift !== null && shift !== 'new' ? shift : null;

  const [name, setName] = useState('');
  const [abbrev, setAbbrev] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => {
    setName(editing?.name ?? '');
    setAbbrev(editing?.abbrev ?? '');
    setStart(editing?.start ?? '');
    setEnd(editing?.end ?? '');
    setColor(editing?.color ?? PALETTE[0]);
  }, [shift]);

  if (shift === null) return null;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    upsertShiftType({
      id: editing?.id ?? newId(),
      name: trimmed,
      abbrev: (abbrev.trim() || trimmed[0]).toUpperCase().slice(0, 3),
      color,
      start: isValidTime(start.trim()) ? start.trim() : '',
      end: isValidTime(end.trim()) ? end.trim() : '',
    });
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    const doDelete = () => {
      deleteShiftType(editing.id);
      onClose();
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`${t('deleteShiftTitle')} ${t('deleteShiftMessage')}`)) doDelete();
    } else {
      Alert.alert(t('deleteShiftTitle'), t('deleteShiftMessage'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.border }];

  return (
    <ModalSheet onClose={onClose}>
            <ThemedText style={styles.title}>
              {editing ? t('editShiftType') : t('addShiftType')}
            </ThemedText>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('name')}
              placeholderTextColor={theme.textSecondary}
              style={inputStyle}
            />
            <View style={styles.row}>
              <TextInput
                value={abbrev}
                onChangeText={setAbbrev}
                placeholder={t('abbrev')}
                maxLength={3}
                placeholderTextColor={theme.textSecondary}
                style={[...inputStyle, styles.rowItem]}
              />
              <TextInput
                value={start}
                onChangeText={setStart}
                placeholder={t('startTime')}
                placeholderTextColor={theme.textSecondary}
                style={[...inputStyle, styles.rowItem]}
              />
              <TextInput
                value={end}
                onChangeText={setEnd}
                placeholder={t('endTime')}
                placeholderTextColor={theme.textSecondary}
                style={[...inputStyle, styles.rowItem]}
              />
            </View>

            <View style={styles.palette}>
              {PALETTE.map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setColor(value)}
                  style={[
                    styles.swatch,
                    { backgroundColor: value },
                    color === value && { borderColor: theme.accent, borderWidth: 3 },
                  ]}
                />
              ))}
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
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rowItem: {
    flex: 1,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
