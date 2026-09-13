import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../navigation/types';
import { listItemsForProcess } from '../services/items';
import { addProcess, listProcesses } from '../services/processes';
import { ProcessItem } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminItemBank'>;

export default function AdminItemBankScreen({ navigation }: Props) {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [newProcess, setNewProcess] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const procs = await listProcesses();
    setProcesses(procs);
    const entries = await Promise.all(procs.map(async (p) => [p.id, (await listItemsForProcess(p.id)).length] as const));
    setCounts(Object.fromEntries(entries));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onAddProcess() {
    if (!newProcess.trim()) return;
    setAdding(true);
    try {
      const id = await addProcess(newProcess.trim());
      setNewProcess('');
      navigation.navigate('AdminTaskDetail', { processId: id, processName: newProcess.trim() });
    } finally {
      setAdding(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Item bank" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          The item bank behind every audit. Tap a task to manage its Knowledge and Technique checklists.
        </Text>

        <Pressable style={styles.candidatesLink} onPress={() => navigation.navigate('AdminCandidates')}>
          <Text style={styles.candidatesLinkText}>Manage candidates</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <View>
          <Text style={styles.sectionLabel}>Tasks</Text>
          <View style={styles.list}>
            {processes.map((p) => (
              <Pressable
                key={p.id}
                style={styles.taskRow}
                onPress={() => navigation.navigate('AdminTaskDetail', { processId: p.id, processName: p.name })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskName}>{p.name}</Text>
                  <Text style={styles.taskMeta}>{counts[p.id] ?? 0} items</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
            {processes.length === 0 && <Text style={styles.empty}>No tasks yet — add one below.</Text>}
          </View>
        </View>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newProcess}
            onChangeText={setNewProcess}
            placeholder="New task name, e.g. Original Gravity"
          />
          <Button label="Add" onPress={onAddProcess} loading={adding} variant="secondary" />
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
  candidatesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: color.text,
    padding: 14,
  },
  candidatesLinkText: { fontFamily: font.semibold, fontSize: 15, color: color.text },
  chevron: { fontFamily: font.semibold, fontSize: 18, color: color.neutral500 },
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: color.text,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  list: { borderTopWidth: 2, borderColor: color.text },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: color.neutral300,
    gap: 10,
  },
  taskName: { fontFamily: font.semibold, fontSize: 16, color: color.text },
  taskMeta: { fontFamily: font.body, fontSize: 12, color: color.neutral600, marginTop: 3 },
  empty: { fontFamily: font.body, fontSize: 13, color: color.neutral600, paddingVertical: 14 },
  addRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
  },
});
