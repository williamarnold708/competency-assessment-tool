import { addDoc, deleteDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { ChecklistItem, Section } from '../types';
import { userCollection, userDoc } from './scope';

export async function listItems(processId: string, section: Section): Promise<ChecklistItem[]> {
  const snap = await getDocs(
    query(userCollection('items'), where('processId', '==', processId), where('section', '==', section), orderBy('order'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChecklistItem, 'id'>) }));
}

export async function listItemsForProcess(processId: string): Promise<ChecklistItem[]> {
  const snap = await getDocs(query(userCollection('items'), where('processId', '==', processId), orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChecklistItem, 'id'>) }));
}

export async function addItem(data: Omit<ChecklistItem, 'id'>): Promise<string> {
  const ref = await addDoc(userCollection('items'), data);
  return ref.id;
}

export async function updateItem(id: string, data: Partial<Omit<ChecklistItem, 'id'>>) {
  await updateDoc(userDoc('items', id), data);
}

export async function deleteItem(id: string) {
  await deleteDoc(userDoc('items', id));
}
