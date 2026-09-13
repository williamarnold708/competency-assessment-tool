import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Candidate } from '../types';

const col = collection(db, 'candidates');

export async function listCandidates(): Promise<Candidate[]> {
  const snap = await getDocs(query(col, orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Candidate, 'id'>) }));
}

export async function addCandidate(data: Omit<Candidate, 'id'>): Promise<string> {
  const ref = await addDoc(col, data);
  return ref.id;
}

export async function updateCandidate(id: string, data: Partial<Omit<Candidate, 'id'>>) {
  await updateDoc(doc(db, 'candidates', id), data);
}

export async function deleteCandidate(id: string) {
  await deleteDoc(doc(db, 'candidates', id));
}
