import { collection, doc, CollectionReference, DocumentReference } from 'firebase/firestore';
import { auth, db } from './firebase';

// Every auditor's data lives under users/{uid}/<collection> — this is what
// makes it private: Firestore rules only allow request.auth.uid == uid to
// read or write anything under that path, so one auditor's candidates,
// item bank, and audits are invisible to every other auditor.

export function currentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return uid;
}

export function userCollection(name: string): CollectionReference {
  return collection(db, 'users', currentUid(), name);
}

export function userDoc(name: string, id: string): DocumentReference {
  return doc(db, 'users', currentUid(), name, id);
}
