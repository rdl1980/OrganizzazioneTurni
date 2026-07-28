import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export const canShare = true;

/** Captures the given view as a PNG and opens the system share sheet. */
export async function shareView(ref: RefObject<View | null>): Promise<void> {
  if (!ref.current) return;
  const uri = await captureRef(ref, { format: 'png', quality: 1 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'image/png' });
  }
}
