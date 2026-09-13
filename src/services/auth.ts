import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function registerAuditor(email: string, password: string, name: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await setDoc(doc(db, 'users', cred.user.uid), { name, email: email.trim() });
  return cred.user;
}

export async function signOutAuditor() {
  await signOut(auth);
}

export async function getAuditorName(uid: string): Promise<string> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return (snap.data().name as string) ?? 'Auditor';
  return 'Auditor';
}
