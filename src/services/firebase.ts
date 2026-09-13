import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
// firebase's package.json "types" condition always points at the web auth
// types here regardless of TS's react-native customCondition, so this named
// export type-checks as missing even though Metro correctly resolves the
// real React Native build (with this function) at runtime.
// @ts-ignore
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// persistentLocalCache keeps ratings/audits readable and writable while
// offline; Firestore syncs queued writes automatically once back online —
// this is the real replacement for the prototype's simulated write queue.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export default app;
