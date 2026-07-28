import { StyleSheet, Text, View } from 'react-native';

import type { ShiftType } from '@/lib/types';

/** Black or white, whichever is readable on the given background. */
export function textColorOn(background: string): string {
  const hex = background.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 145 ? '#000000' : '#ffffff';
}

export function ShiftPill({ shift, small }: { shift: ShiftType; small?: boolean }) {
  return (
    <View style={[styles.pill, small && styles.pillSmall, { backgroundColor: shift.color }]}>
      <Text
        numberOfLines={1}
        style={[styles.label, small && styles.labelSmall, { color: textColorOn(shift.color) }]}>
        {small ? shift.abbrev : shift.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  pillSmall: {
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 1,
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
});
