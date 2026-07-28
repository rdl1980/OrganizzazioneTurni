import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const isWeb = Platform.OS === 'web';

/** Bottom sheet on mobile, centered dialog on web. */
export function ModalSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const theme = useTheme();

  return (
    <Modal visible transparent animationType={isWeb ? 'fade' : 'slide'} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.cardWrapper}>
          <ThemedView type="backgroundElement" style={styles.card}>
            {!isWeb && (
              <View style={[styles.handle, { backgroundColor: theme.backgroundSelected }]} />
            )}
            {children}
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: isWeb ? 'center' : 'flex-end',
    alignItems: 'center',
    padding: isWeb ? Spacing.four : 0,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: isWeb ? 460 : undefined,
  },
  card: {
    borderRadius: Radius.xl,
    borderBottomLeftRadius: isWeb ? Radius.xl : 0,
    borderBottomRightRadius: isWeb ? Radius.xl : 0,
    padding: Spacing.four,
    paddingBottom: isWeb ? Spacing.four : Spacing.five,
    gap: Spacing.three,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: -Spacing.two,
  },
});
