# Shift Calendar — Specifica prodotto (v1 + v2 prima della pubblicazione)

App calendario turni per lavoratori a turni (infermieri, forze dell'ordine, operai, ristorazione, GDO).
Stack: React Native + Expo (TypeScript, expo-router). Local-first con sync cloud opzionale. Lingue: EN + IT.

**Decisione (28 lug 2026):** il prodotto si pubblica una sola volta, completo delle feature v2
(auth, sync, condivisione, stipendio, import AI). Commercializzazione e store sono le ultime milestone.

## Posizionamento

I competitor principali (Shift Calendar, Work Shift Calendar, Shift Work Calendar) hanno recensioni
negative ricorrenti su tre punti — che sono i nostri differenziatori:

1. **Turni illimitati anche nella free** — un competitor limita la PRO a 3 tipi di turno.
2. **Pattern di rotazione automatici** — imposti il ciclo e l'app compila il calendario per mesi.
3. **Condivisione ed export senza limiti** — i competitor limitano la condivisione a un mese alla volta.

In più, rispetto a tutti loro: sync multi-dispositivo, calendari condivisi coi colleghi, stima
stipendio e import del piano turni da foto — feature da app "premium" in un prodotto indie.

## Feature complete (tutte prima della pubblicazione)

Core (fatte):
- Tipi di turno personalizzati (nome, sigla, colore, orari, illimitati)
- Calendario mensile con assegnazione a tap, note per giorno, statistiche mese (conteggi + ore)
- Pattern di rotazione virtuali con override per giorno
- Notifica promemoria serale del turno di domani (ora configurabile)
- Export immagine del mese, dark mode, EN+IT

Da fare:
- Backup/restore locale JSON; export PDF multi-mese
- **Account opzionale** (Sign in with Apple / Google / email via Supabase) — l'app resta pienamente
  usabile senza account; l'account sblocca le feature cloud
- **Sync cloud multi-dispositivo** (offline-first: il locale resta la fonte primaria, merge col cloud)
- **Calendari condivisi**: condividi il tuo calendario in sola lettura con famiglia/colleghi via invito;
  ruoli owner/viewer (authorization lato server con RLS Supabase)
- **Calcolo stipendio**: tariffa oraria per tipo di turno, maggiorazioni (notte/festivi), stima mensile
- **Import piano turni da foto (AI)**: scatti la foto del piano cartaceo, l'AI compila il mese
  (Claude API lato server — costo variabile per scansione, feature a consumo)
- **Widget home screen** (iOS WidgetKit / Android Glance — richiede dev build EAS)
- Long-press per selezione multipla giorni (rifinitura)

## Monetizzazione (da ridiscutere alla milestone 13)

Il piano originale era PRO one-shot 4,99€ senza abbonamenti. Con le feature cloud ci sono **costi
ricorrenti** (Supabase, API AI), quindi il modello diventa ibrido:
- **Free**: tutto il core locale (turni illimitati, calendario, pattern, notifiche)
- **PRO one-shot (4,99€)**: export PDF, statistiche avanzate, stipendio, widget, backup locale
- **Cloud (abbonamento ~1,99€/mese o 14,99€/anno)**: sync, calendari condivisi, import AI (con quota)
Prezzi da validare alla milestone 13. IAP via RevenueCat.

## Architettura

- **Locale**: AsyncStorage + JSON, store centralizzato in `src/lib/store.tsx` (fonte primaria, sempre).
- **Cloud (da costruire)**: Supabase (Postgres + Auth + RLS). Sync a livello di store: coda di modifiche
  → push; pull al login/avvio; conflitti risolti last-write-wins per chiave (volumi piccoli, rischio basso).
- Entità: `ShiftType`, `DayAssignment` (per data), `RotationPattern` + `activePattern`, `Settings`.
  Regola: le assegnazioni esplicite sovrascrivono il pattern.
- Piattaforme: iOS + Android; web solo come ambiente di sviluppo.
- Test: jest-expo (`npm test`) su logica core; da estendere a sync/merge e calcolo stipendio.

## Nome app

Da decidere alla milestone 14 (verificare collisioni store/domini).
Candidati: **ShiftNest**, **TurnoCal**, **ShiftLoop**, **RotaMate**. Working name: `shift-calendar`.

## Backlog

Fatte:
1. ✅ Setup (scaffold Expo, repo, tema, i18n)
2. ✅ Core (tipi turno, calendario, assegnazioni, note, statistiche)
3. ✅ Pattern di rotazione con override
4. ✅ Notifiche promemoria + redesign UI (token semantici, celle tinta-turno, bottom-sheet)
5. ✅ Suite di test (22) + export immagine mese

Da fare (in ordine):
6. **Completamento locale**: backup/restore JSON, export PDF multi-mese, long-press multi-selezione
7. **Backend & Auth**: progetto Supabase; Sign in with Apple + Google + email (Apple obbligatorio
   se c'è login di terze parti); account opzionale, app usabile senza
8. **Sync cloud**: layer di sync sopra lo store locale (offline-first), migrazione dei dati locali
   al primo login, test su merge/conflitti
9. **Calendari condivisi**: inviti, ruoli owner/viewer, RLS lato server
10. **Calcolo stipendio**: tariffe per turno, maggiorazioni, stima mese (+ test)
11. **Import da foto (AI)**: upload foto → edge function → Claude API → proposte di assegnazione
    da confermare; quota per utente
12. **EAS dev build**: build di sviluppo iOS/Android, test reale su dispositivo di notifiche,
    export, auth; poi **widget home screen**
13. **Monetizzazione**: RevenueCat, paywall, decisione finale prezzi (PRO one-shot + Cloud sub)
14. **Store & lancio**: nome definitivo, icona, screenshot, ASO (EN+IT), privacy policy (ora
    necessaria per davvero: ci sono dati in cloud), submission Apple/Google
