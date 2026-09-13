import { addDoc, deleteDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { ProcessItem } from '../types';
import { userCollection, userDoc } from './scope';

export async function listProcesses(): Promise<ProcessItem[]> {
  const snap = await getDocs(query(userCollection('processes'), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProcessItem, 'id'>) }));
}

export async function addProcess(name: string): Promise<string> {
  const ref = await addDoc(userCollection('processes'), { name });
  return ref.id;
}

export async function updateProcess(id: string, name: string) {
  await updateDoc(userDoc('processes', id), { name });
}

export async function deleteProcess(id: string) {
  await deleteDoc(userDoc('processes', id));
}
