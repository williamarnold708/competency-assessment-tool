import { addDoc, deleteDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { Candidate } from '../types';
import { userCollection, userDoc } from './scope';

export async function listCandidates(): Promise<Candidate[]> {
  const snap = await getDocs(query(userCollection('candidates'), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Candidate, 'id'>) }));
}

export async function addCandidate(data: Omit<Candidate, 'id'>): Promise<string> {
  const ref = await addDoc(userCollection('candidates'), data);
  return ref.id;
}

export async function updateCandidate(id: string, data: Partial<Omit<Candidate, 'id'>>) {
  await updateDoc(userDoc('candidates', id), data);
}

export async function deleteCandidate(id: string) {
  await deleteDoc(userDoc('candidates', id));
}
