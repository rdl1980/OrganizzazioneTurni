# Shift Calendar — Specifica prodotto (Personal + Team)

App calendario turni per lavoratori a turni (infermieri, forze dell'ordine, operai, ristorazione, GDO).
Stack: React Native + Expo (TypeScript, expo-router). Lingue: EN + IT.

**Decisione (28 lug 2026):** due prodotti.
- **Personal** (questa app): 100% locale, niente account, niente abbonamenti. Free + PRO one-shot 4,99€.
  Si lancia appena completa (fase 1).
- **Team** (prodotto separato, fase 2): per chi FA i piani turni (ristoranti, negozi, farmacie,
  cliniche). Manager crea il team, pubblica il piano, i dipendenti lo vedono con notifiche.
  Abbonamento per team (il manager paga, i dipendenti gratis). Qui vivono auth (Supabase),
  cloud, inviti/ruoli e import piano da foto (AI). L'app Personal è il canale di acquisizione.

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

Da fare (Personal):
- Backup/restore locale JSON (copre il cambio telefono senza account)
- Export PDF multi-mese; long-press per selezione multipla giorni
- **Calcolo stipendio**: tariffa oraria per tipo di turno, maggiorazione domenica, stima mensile
- **Widget home screen** (iOS WidgetKit / Android Glance — richiede dev build EAS)

Team (prodotto separato, fase 2): auth, team/inviti/ruoli (RLS Supabase), pubblicazione piano,
app dipendente con notifiche, import piano da foto (Claude API).

## Monetizzazione

**Personal — niente abbonamenti** (argomento di vendita, i competitor li impongono):
- **Free**: tutto il core locale (turni illimitati, calendario, pattern, notifiche, export immagine)
- **PRO one-shot (4,99€)**: export PDF multi-mese, calcolo stipendio, widget, backup/restore
- IAP via RevenueCat.

**Team — abbonamento per team** (~9,99-19,99€/mese, il manager paga): copre i costi ricorrenti
(Supabase, AI). Prezzi da validare al lancio della fase 2.

## Architettura (Personal)

- AsyncStorage + JSON, store centralizzato in `src/lib/store.tsx`. Nessun backend.
- Entità: `ShiftType` (+ tariffa €/h opzionale), `DayAssignment` (per data), `RotationPattern`
  + `activePattern`, `Settings`. Regola: le assegnazioni esplicite sovrascrivono il pattern.
- Piattaforme: iOS + Android; web solo come ambiente di sviluppo.
- Test: jest-expo (`npm test`) su logica core (date, ore, pattern, stipendio, backup).

## Nome app

Da decidere alla milestone 10 (verificare collisioni store/domini).
Candidati: **ShiftNest**, **TurnoCal**, **ShiftLoop**, **RotaMate**. Working name: `shift-calendar`.

## Backlog

Fase 1 — Personal:
1. ✅ Setup (scaffold Expo, repo, tema, i18n)
2. ✅ Core (tipi turno, calendario, assegnazioni, note, statistiche)
3. ✅ Pattern di rotazione con override
4. ✅ Notifiche promemoria + redesign UI (token semantici, celle tinta-turno, bottom-sheet)
5. ✅ Suite di test + export immagine mese
6. **Completamento locale**: backup/restore JSON, export PDF multi-mese, long-press multi-selezione
7. **Calcolo stipendio**: tariffa €/h per tipo turno, maggiorazione domenica %, stima mese (+ test)
8. **EAS dev build**: build di sviluppo iOS/Android, test reale su dispositivo (notifiche, export),
   poi widget home screen. Richiede: account Expo (gratis), Apple Developer (99$/anno),
   Google Play Console (25$ una tantum).
9. **Paywall PRO**: RevenueCat + react-native-purchases (richiede la dev build della 8),
   prodotti configurati su App Store Connect / Play Console.
10. **Store & lancio Personal**: nome definitivo, icona, screenshot, ASO (EN+IT), privacy policy
    (semplice: nessun dato raccolto), submission Apple/Google.

Fase 2 — Team (nuovo progetto, a Personal pubblicata):
11. Supabase + auth (Apple/Google/email), modello team/inviti/ruoli con RLS
12. Manager: editor piano turni (riusa componenti Personal), pubblicazione
13. Dipendente: vista calendario personale + notifiche cambi
14. Import piano da foto (edge function → Claude API), quota per team
15. Abbonamento team (RevenueCat) + store & lancio Team
