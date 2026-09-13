import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { ChecklistItem, Section } from '../types';

const col = collection(db, 'items');

export async function listItems(processId: string, section: Section): Promise<ChecklistItem[]> {
  const snap = await getDocs(
    query(col, where('processId', '==', processId), where('section', '==', section), orderBy('order'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChecklistItem, 'id'>) }));
}

export async function listItemsForProcess(processId: string): Promise<ChecklistItem[]> {
  const snap = await getDocs(query(col, where('processId', '==', processId), orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChecklistItem, 'id'>) }));
}

export async function addItem(data: Omit<ChecklistItem, 'id'>): Promise<string> {
  const ref = await addDoc(col, data);
  return ref.id;
}

export async function updateItem(id: string, data: Partial<Omit<ChecklistItem, 'id'>>) {
  await updateDoc(doc(db, 'items', id), data);
}

export async function deleteItem(id: string) {
  await deleteDoc(doc(db, 'items', id));
}
