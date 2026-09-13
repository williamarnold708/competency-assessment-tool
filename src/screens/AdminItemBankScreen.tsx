import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { CriticalTag } from '../components/Tag';
import { RootStackParamList } from '../navigation/types';
import { addCandidate, deleteCandidate, listCandidates } from '../services/candidates';
import { deleteItem, listItemsForProcess } from '../services/items';
import { addProcess, deleteProcess, listProcesses } from '../services/processes';
import { Candidate, ChecklistItem, ProcessItem, Section } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminItemBank'>;

export default function AdminItemBankScreen({ navigation }: Props) {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [itemsByProcess, setItemsByProcess] = useState<Record<string, ChecklistItem[]>>({});
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newProcess, setNewProcess] = useState('');
  const [newCandName, setNewCandName] = useState('');
  const [newCandRole, setNewCandRole] = useState('');

  const load = useCallback(async () => {
    const [procs, cands] = await Promise.all([listProcesses(), listCandidates()]);
    setProcesses(procs);
    setCandidates(cands);
    const entries = await Promise.all(procs.map(async (p) => [p.id, await listItemsForProcess(p.id)] as const));
    setItemsByProcess(Object.fromEntries(entries));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onAddProcess() {
    if (!newProcess.trim()) return;
    await addProcess(newProcess.trim());
    setNewProcess('');
    load();
  }

  async function onDeleteProcess(id: string) {
    Alert.alert('Delete task', 'This removes the task and its assessment items. Completed audits keep their own record.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const items = itemsByProcess[id] ?? [];
          await Promise.all(items.map((it) => deleteItem(it.id)));
          await deleteProcess(id);
          load();
        },
      },
    ]);
  }

  async function onDeleteItem(itemId: string) {
    await deleteItem(itemId);
    load();
  }

  async function onAddCandidate() {
    if (!newCandName.trim()) return;
    await addCandidate({ name: newCandName.trim(), role: newCandRole.trim() || 'Analyst', expectedLevelDefault: 5 });
    setNewCandName('');
    setNewCandRole('');
    load();
  }

  async function onDeleteCandidate(id: string) {
    await deleteCandidate(id);
    load();
  }

  function renderSection(process: ProcessItem, section: Section, title: string) {
    const items = (itemsByProcess[process.id] ?? []).filter((i) => i.section === section);
    return (
      <View style={styles.subSection}>
        <View style={styles.subHeader}>
          <Text style={styles.subTitle}>
            {title} · {items.length} items
          </Text>
          <Pressable
            onPress={() => navigation.navigate('AdminItemForm', { processId: process.id, section })}
          >
            <Text style={styles.addLink}>+ Add</Text>
          </Pressable>
        </View>
        {items.map((it, i) => (
          <View key={it.id} style={styles.itemRow}>
            <Text style={styles.itemNum}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.itemText} numberOfLines={2}>
              {it.text}
            </Text>
            {it.critical && <CriticalTag />}
            <Pressable
              onPress={() => navigation.navigate('AdminItemForm', { processId: process.id, section, itemId: it.id })}
            >
              <Text style={styles.itemAction}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => onDeleteItem(it.id)}>
              <Text style={[styles.itemAction, { color: color.accent700 }]}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Item bank" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          The item bank behind every audit. Edits apply to audits started from now on; completed audits keep the
          wording they were scored against.
        </Text>

        <View>
          <Text style={styles.sectionLabel}>Add a task</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={newProcess}
              onChangeText={setNewProcess}
              placeholder="e.g. Original Gravity"
            />
            <Button label="Add" onPress={onAddProcess} variant="secondary" />
          </View>
        </View>

        {processes.map((p) => (
          <View key={p.id} style={styles.processBlock}>
            <View style={styles.processHeader}>
              <Text style={styles.processName}>{p.name}</Text>
              <Pressable onPress={() => onDeleteProcess(p.id)}>
                <Text style={styles.itemAction}>Delete task</Text>
              </Pressable>
            </View>
            {renderSection(p, 'kp', 'Knowledge & practice')}
            {renderSection(p, 'ts', 'Technique & skill')}
          </View>
        ))}

        <View>
          <Text style={styles.sectionLabel}>Candidates</Text>
          <View style={styles.addRow}>
            <TextInput style={[styles.input, { flex: 1.4 }]} value={newCandName} onChangeText={setNewCandName} placeholder="Name" />
            <TextInput style={styles.input} value={newCandRole} onChangeText={setNewCandRole} placeholder="Role" />
            <Button label="Add" onPress={onAddCandidate} variant="secondary" />
          </View>
          {candidates.map((c) => (
            <View key={c.id} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {c.name} · {c.role}
              </Text>
              <Pressable onPress={() => onDeleteCandidate(c.id)}>
                <Text style={[styles.itemAction, { color: color.accent700 }]}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 22 },
  intro: { fontFamily: font.body, fontSize: 13, color: color.neutral700, lineHeight: 19 },
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: color.text,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 10,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
  },
  processBlock: { gap: 10 },
  processHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 2,
    borderColor: color.text,
    paddingBottom: 8,
  },
  processName: { fontFamily: font.semibold, fontSize: 15, color: color.text },
  subSection: { gap: 6 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  subTitle: { fontFamily: font.semibold, fontSize: 11, color: color.neutral600, letterSpacing: 0.5, textTransform: 'uppercase' },
  addLink: { fontFamily: font.semibold, fontSize: 12, color: color.accent700 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: color.neutral300, paddingVertical: 10 },
  itemNum: { fontFamily: font.semibold, fontSize: 12, color: color.neutral500, minWidth: 20 },
  itemText: { flex: 1, fontFamily: font.body, fontSize: 13.5, color: color.text },
  itemAction: { fontFamily: font.semibold, fontSize: 12, color: color.neutral700 },
});
