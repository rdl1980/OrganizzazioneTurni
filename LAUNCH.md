# Checklist verso il lancio (milestone 8-10)

Le milestone restanti richiedono account personali: qui c'è tutto ciò che serve, in ordine.

## Milestone 8 — EAS dev build + widget

Prerequisiti (da fare tu, una volta sola):
1. **Account Expo** (gratis): https://expo.dev/signup → poi `npx eas login` nella cartella del progetto.
2. **Apple Developer Program** (99$/anno): https://developer.apple.com/programs/enroll/
   Serve per: build iOS su dispositivo, notifiche, widget, e la submission finale.
3. **Google Play Console** (25$ una tantum): https://play.google.com/console/signup

Poi (facciamo insieme):
- `npx eas build --profile development --platform android` (la prima build Android non richiede
  ancora il Play Console: si installa l'APK direttamente)
- Test su dispositivo: notifiche promemoria, export immagine/PDF, backup/restore
- Widget home screen (iOS WidgetKit via config plugin, Android Glance)

## Milestone 9 — Paywall PRO (4,99€ one-shot)

1. **RevenueCat** (gratis fino a 2.5k$/mese): https://app.revenuecat.com/signup
2. Prodotto IAP "pro_lifetime" creato su App Store Connect e Play Console
3. `npx expo install react-native-purchases` + paywall (richiede la dev build della M8, non Expo Go)

Feature gate PRO: export PDF multi-mese, calcolo stipendio, widget, backup/restore.
Free: tutto il resto (calendario, turni illimitati, pattern, notifiche, export immagine).

## Milestone 10 — Store & lancio

- Nome definitivo (candidati: ShiftNest, TurnoCal, ShiftLoop, RotaMate) — verificare collisioni
  su App Store/Play e disponibilità dominio
- Icona + splash (sostituire gli asset del template in `assets/images/`)
- `app.json`: name, slug, bundleIdentifier/package (es. `com.rdl.shiftcalendar`), version
- Screenshot store (6.7" iPhone, tablet opzionale, telefono Android) in EN + IT
- Scheda store ASO: titolo con keyword ("Shift Calendar - Turni"), sottotitolo, descrizione EN+IT
- Privacy policy (una pagina: "nessun dato raccolto, tutto resta sul dispositivo")
- `npx eas build --profile production` + `npx eas submit` per entrambi gli store
