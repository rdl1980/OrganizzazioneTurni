import { getLocales } from 'expo-localization';

const en = {
  tabCalendar: 'Calendar',
  tabShifts: 'Shifts',
  today: 'Today',
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  noShift: 'No shift',
  notePlaceholder: 'Note (e.g. 2h overtime)',
  save: 'Save',
  cancel: 'Cancel',
  shiftTypesTitle: 'Shift types',
  addShiftType: 'New shift type',
  editShiftType: 'Edit shift type',
  name: 'Name',
  abbrev: 'Short label',
  startTime: 'Start (HH:MM)',
  endTime: 'End (HH:MM)',
  color: 'Color',
  delete: 'Delete',
  deleteShiftTitle: 'Delete shift type?',
  deleteShiftMessage: 'Days assigned to this shift will be cleared.',
  hoursShort: 'h',
  totalHours: 'Total hours',
  defaultMorning: 'Morning',
  defaultAfternoon: 'Afternoon',
  defaultNight: 'Night',
  defaultRest: 'Rest',
};

const it: typeof en = {
  tabCalendar: 'Calendario',
  tabShifts: 'Turni',
  today: 'Oggi',
  months: [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
  ],
  weekdaysShort: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  noShift: 'Nessun turno',
  notePlaceholder: 'Nota (es. straordinario 2h)',
  save: 'Salva',
  cancel: 'Annulla',
  shiftTypesTitle: 'Tipi di turno',
  addShiftType: 'Nuovo tipo di turno',
  editShiftType: 'Modifica tipo di turno',
  name: 'Nome',
  abbrev: 'Sigla',
  startTime: 'Inizio (HH:MM)',
  endTime: 'Fine (HH:MM)',
  color: 'Colore',
  delete: 'Elimina',
  deleteShiftTitle: 'Eliminare il tipo di turno?',
  deleteShiftMessage: 'I giorni assegnati a questo turno verranno svuotati.',
  hoursShort: 'h',
  totalHours: 'Ore totali',
  defaultMorning: 'Mattina',
  defaultAfternoon: 'Pomeriggio',
  defaultNight: 'Notte',
  defaultRest: 'Riposo',
};

const strings = getLocales()[0]?.languageCode === 'it' ? it : en;

export function t<K extends keyof typeof en>(key: K): (typeof en)[K] {
  return strings[key];
}
