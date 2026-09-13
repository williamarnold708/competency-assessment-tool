import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ProcessItem } from '../types';

const col = collection(db, 'processes');

export async function listProcesses(): Promise<ProcessItem[]> {
  const snap = await getDocs(query(col, orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProcessItem, 'id'>) }));
}

export async function addProcess(name: string): Promise<string> {
  const ref = await addDoc(col, { name });
  return ref.id;
}

export async function updateProcess(id: string, name: string) {
  await updateDoc(doc(db, 'processes', id), { name });
}

export async function deleteProcess(id: string) {
  await deleteDoc(doc(db, 'processes', id));
}
