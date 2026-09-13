# Competency Assessment Tool

A lab skill assessment / audit app: an auditor rates a candidate against a
knowledge-and-practice (K&P) and technique-and-skill (TS) checklist, sees a
scored result and awarded competency level, then hands the device to the
candidate to confirm sign-off.

This replaces an earlier Power Apps + SharePoint version that had two
unfixable problems: sign-off timestamps displayed in the wrong timezone (a
SharePoint-connector/locale quirk), and the UI was slow because every tap
round-tripped to SharePoint. This app fixes both: timestamps are always
formatted with an explicit `timeZone` (see `src/theme/tokens.ts`), never left
to device/locale defaults; and Firestore's local cache makes ratings feel
instant, syncing in the background.

The screens, data model, scoring rules, and visual design ("Modernist" —
sharp corners, bold Archivo type, black rules, red-orange accent) come from a
Claude Design prototype, preserved under [`design/`](design/) for reference.

## Stack

- Expo (React Native) + TypeScript
- React Navigation (native-stack)
- Firebase Auth (email/password) + Firestore

## Getting started

```bash
npm install
```

### 1. Firebase project

Create a Firebase project (or use an existing one) at
[console.firebase.google.com](https://console.firebase.google.com), then:

1. Enable **Authentication > Email/Password**.
2. Enable **Firestore Database** (production mode).
3. Add a **Web app** to the project and copy its config into `app.json` under
   `expo.extra.firebase` (apiKey, authDomain, projectId, storageBucket,
   messagingSenderId, appId).
4. Deploy the security rules and indexes in this repo:
   ```bash
   npx firebase-tools login
   npx firebase-tools use --add   # pick your project
   npx firebase-tools deploy --only firestore
   ```

### 2. Seed sample data (optional)

Download a service account key (Project settings > Service accounts >
Generate new private key) and save it as `scripts/serviceAccountKey.json`
(gitignored), then:

```bash
node scripts/seed.js
```

This loads the prototype's sample "IBU Analysis" item bank and four sample
candidates, so the app isn't empty on first run.

### 3. Run the app

```bash
npm run android   # or: npx expo start, then press "a"
```

The first account you create from the app's "Create account" link becomes an
auditor. Item bank and candidate management is under **Home > Assessment
items**.

### 4. Build an APK

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

Requires a free Expo account. See `eas.json` for build profiles.

## Project structure

```
App.tsx
src/
  navigation/     screen types + the stack navigator
  screens/        one file per screen
  components/     shared UI primitives (Button, Tag, RatingSegment, ...)
  theme/          design tokens ported from the prototype's Modernist system
  services/       Firebase init + Firestore CRUD per collection
  lib/            scoring rules and date formatting (ported from the prototype)
  context/        auth state
scripts/seed.js   loads sample data into Firestore
design/           the original Claude Design prototype, kept for reference
firestore.rules, firestore.indexes.json, firebase.json
```
