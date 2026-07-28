import type { RefObject } from 'react';
import type { View } from 'react-native';

// Image export relies on native view snapshots; not offered on web.

export const canShare = false;

export async function shareView(_ref: RefObject<View | null>): Promise<void> {}
