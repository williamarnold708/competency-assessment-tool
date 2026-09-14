import { addDoc, deleteDoc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { ProcessItem } from '../types';
import { userCollection, userDoc } from './scope';

export async function listProcesses(): Promise<ProcessItem[]> {
  const snap = await getDocs(query(userCollection('processes'), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProcessItem, 'id'>) }));
}

export async function getProcess(id: string): Promise<ProcessItem | null> {
  const snap = await getDoc(userDoc('processes', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<ProcessItem, 'id'>) };
}

export async function addProcess(name: string): Promise<string> {
  const ref = await addDoc(userCollection('processes'), { name });
  return ref.id;
}

export async function updateProcess(id: string, name: string) {
  await updateDoc(userDoc('processes', id), { name });
}

export async function updateProcessScenario(id: string, scenario: string) {
  await updateDoc(userDoc('processes', id), { scenario });
}

export async function deleteProcess(id: string) {
  await deleteDoc(userDoc('processes', id));
}
