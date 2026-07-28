# Shift Calendar — Specifica MVP

App calendario turni per lavoratori a turni (infermieri, forze dell'ordine, operai, ristorazione, GDO).
Stack: React Native + Expo (TypeScript, expo-router). Dati solo locali (nessun backend). Lingue: EN + IT.

## Posizionamento

I competitor principali (Shift Calendar, Work Shift Calendar, Shift Work Calendar) hanno recensioni
negative ricorrenti su tre punti — che sono i nostri differenziatori:

1. **Turni illimitati anche nella free** — un competitor limita la PRO a 3 tipi di turno.
2. **Pattern di rotazione automatici** — imposti il ciclo (es. 2 mattine, 2 pomeriggi, 2 notti, 2 riposi)
   e l'app compila il calendario per mesi in avanti.
3. **Condivisione ed export senza limiti** — i competitor limitano la condivisione a un mese alla volta;
   noi: export immagine/PDF di N mesi + condivisione del pattern.

## Feature MVP (v1.0)

- **Tipi di turno personalizzati**: nome, abbreviazione, colore, orario inizio/fine, illimitati.
- **Calendario mensile**: tap su un giorno per assegnare il turno; long-press per selezione multipla.
- **Pattern di rotazione**: definisci una sequenza ciclica e applicala da una data in poi; gestione eccezioni (sovrascrivi il singolo giorno).
- **Note per giorno** (es. "straordinario 2h", "cambio con Marco").
- **Statistiche mese**: conteggio per tipo di turno, ore totali.
- **Widget home screen** (iOS + Android): oggi + prossimi giorni.
- **Notifica promemoria** turno del giorno dopo (ora configurabile).
- **Export/condivisione**: immagine del mese (v1), PDF multi-mese (v1.1).
- **Backup/restore locale**: export/import file JSON.
- **Dark mode**, localizzazione EN + IT.

## Fuori scope MVP (eventuale v2)

- Sync cloud / multi-dispositivo
- Calendari condivisi tra colleghi
- Calcolo stipendio/maggiorazioni
- Import da fotografia del piano turni (AI)

## Monetizzazione

Free: tutto il core (turni illimitati, calendario, pattern).
**PRO (one-shot 4,99€)**: widget, statistiche avanzate, export PDF multi-mese, backup, icone app alternative.
Nessun abbonamento: in questa categoria gli utenti li odiano (evidenza dalle recensioni dei competitor).
IAP gestito con RevenueCat (o StoreKit/Play Billing via expo-iap).

## Architettura dati (locale)

- Storage: SQLite (expo-sqlite) o AsyncStorage+JSON — decidere in fase di setup; SQLite preferito per query statistiche.
- Entità: `ShiftType` (id, name, abbrev, color, start, end), `DayAssignment` (date, shiftTypeId, note),
  `RotationPattern` (id, name, sequence[], anchorDate).
- Regola: le assegnazioni esplicite sovrascrivono il pattern.

## Nome app

Da decidere prima della pubblicazione (verificare collisioni su App Store/Play/domini).
Candidati: **ShiftNest**, **TurnoCal**, **ShiftLoop**, **RotaMate**. Working name: `shift-calendar`.

## Milestone

1. Setup: scaffold Expo ✅, repo git, SQLite, tema, i18n.
2. Core: tipi di turno + calendario mensile + assegnazione.
3. Pattern di rotazione + eccezioni.
4. Note, statistiche, notifiche.
5. Widget + export immagine.
6. PRO/IAP + paywall.
7. Store: icone, screenshot, ASO (EN+IT), submission Apple/Google.
