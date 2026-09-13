import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { addCandidate, deleteCandidate, listCandidates } from '../services/candidates';
import { RootStackParamList } from '../navigation/types';
import { Candidate } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminCandidates'>;

export default function AdminCandidatesScreen({ navigation }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setCandidates(await listCandidates());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await addCandidate({ name: name.trim(), role: role.trim() || 'Analyst', expectedLevelDefault: 5 });
      setName('');
      setRole('');
      load();
    } finally {
      setAdding(false);
    }
  }

  async function onDelete(id: string) {
    await deleteCandidate(id);
    load();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Candidates" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {candidates.map((c) => (
            <View key={c.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.role}>{c.role}</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => onDelete(c.id)}>
                <Text style={styles.deleteLink}>Delete</Text>
              </Pressable>
            </View>
          ))}
          {candidates.length === 0 && <Text style={styles.empty}>No candidates yet — add one below.</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Role</Text>
          <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="e.g. Analyst" />
        </View>
        <Button label="Add candidate" onPress={onAdd} loading={adding} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 18 },
  list: { borderTopWidth: 2, borderColor: color.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: color.neutral300 },
  name: { fontFamily: font.semibold, fontSize: 15, color: color.text },
  role: { fontFamily: font.body, fontSize: 12, color: color.neutral600, marginTop: 2 },
  deleteLink: { fontFamily: font.semibold, fontSize: 12, color: color.accent700 },
  empty: { fontFamily: font.body, fontSize: 13, color: color.neutral600, paddingVertical: 14 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1, color: color.neutral600, textTransform: 'uppercase' },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
    fontSize: 15,
    color: color.text,
  },
});
