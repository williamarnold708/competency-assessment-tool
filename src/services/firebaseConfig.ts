import Constants from 'expo-constants';

// Populated from app.config values (see app.json "extra.firebase") or env vars
// at build time. Fill these in once the Firebase project exists — see
// README.md "Firebase setup".
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, any>;
const fb = extra.firebase ?? {};

export const firebaseConfig = {
  apiKey: fb.apiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: fb.authDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: fb.projectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: fb.storageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: fb.messagingSenderId ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: fb.appId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
