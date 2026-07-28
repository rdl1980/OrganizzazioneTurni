import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { t } from '@/lib/i18n';
import type { AppData, DayAssignment, ShiftType } from '@/lib/types';

const STORAGE_KEY = 'shift-calendar/data/v1';

function defaultData(): AppData {
  return {
    shiftTypes: [
      { id: 'morning', name: t('defaultMorning'), abbrev: 'M', color: '#F5B940', start: '06:00', end: '14:00' },
      { id: 'afternoon', name: t('defaultAfternoon'), abbrev: 'P', color: '#F08036', start: '14:00', end: '22:00' },
      { id: 'night', name: t('defaultNight'), abbrev: 'N', color: '#5B5BD6', start: '22:00', end: '06:00' },
      { id: 'rest', name: t('defaultRest'), abbrev: 'R', color: '#8D8D8D', start: '', end: '' },
    ],
    assignments: {},
  };
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type StoreValue = {
  loaded: boolean;
  data: AppData;
  upsertShiftType: (shift: ShiftType) => void;
  deleteShiftType: (id: string) => void;
  setDay: (key: string, assignment: DayAssignment | null) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setData(JSON.parse(raw) as AppData);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  const upsertShiftType = (shift: ShiftType) =>
    setData((prev) => {
      const exists = prev.shiftTypes.some((s) => s.id === shift.id);
      return {
        ...prev,
        shiftTypes: exists
          ? prev.shiftTypes.map((s) => (s.id === shift.id ? shift : s))
          : [...prev.shiftTypes, shift],
      };
    });

  const deleteShiftType = (id: string) =>
    setData((prev) => {
      const assignments = Object.fromEntries(
        Object.entries(prev.assignments).filter(([, a]) => a.shiftTypeId !== id),
      );
      return {
        shiftTypes: prev.shiftTypes.filter((s) => s.id !== id),
        assignments,
      };
    });

  const setDay = (key: string, assignment: DayAssignment | null) =>
    setData((prev) => {
      const assignments = { ...prev.assignments };
      if (assignment === null || (assignment.shiftTypeId === null && !assignment.note)) {
        delete assignments[key];
      } else {
        assignments[key] = assignment;
      }
      return { ...prev, assignments };
    });

  return (
    <StoreContext.Provider value={{ loaded, data, upsertShiftType, deleteShiftType, setDay }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
}
