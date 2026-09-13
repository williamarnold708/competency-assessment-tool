import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { createAudit } from '../services/audits';
import { listCandidates } from '../services/candidates';
import { listProcesses } from '../services/processes';
import { Candidate, ProcessItem } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'NewAuditSetup'>;

export default function NewAuditSetupScreen({ navigation }: Props) {
  const { user, auditorName } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [candIdx, setCandIdx] = useState<number | null>(null);
  const [procIdx, setProcIdx] = useState<number | null>(null);
  const [expected, setExpected] = useState(5);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([listCandidates(), listProcesses()]);
      setCandidates(c);
      setProcesses(p);
      setLoading(false);
    })();
  }, []);

  function pickCandidate(i: number) {
    setCandIdx(i);
    setExpected(candidates[i].expectedLevelDefault || 5);
  }

  const candidate = candIdx !== null ? candidates[candIdx] : null;
  const process = procIdx !== null ? processes[procIdx] : null;
  const canBegin = !!candidate && !!process && !starting;

  async function begin() {
    if (!candidate || !process || !user) return;
    setStarting(true);
    try {
      const id = await createAudit({
        candidateId: candidate.id,
        candidateName: candidate.name,
        processId: process.id,
        processName: process.name,
        auditorId: user.uid,
        auditorName: auditorName || 'Auditor',
        expectedLevel: expected,
      });
      navigation.replace('Checklist', { auditId: id, section: 'kp' });
    } finally {
      setStarting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="New audit" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.sectionLabel}>Auditee</Text>
          <View style={styles.grid}>
            {candidates.map((c, i) => {
              const on = candIdx === i;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => pickCandidate(i)}
                  style={[styles.pickCard, on ? styles.pickCardOn : styles.pickCardOff]}
                >
                  <Text style={[styles.pickTitle, on && { color: color.white }]}>{c.name}</Text>
                  <Text style={[styles.pickSub, on && { color: color.white, opacity: 0.75 }]}>{c.role}</Text>
                </Pressable>
              );
            })}
            {!loading && candidates.length === 0 && (
              <Text style={styles.empty}>No candidates yet. Add them from Assessment items.</Text>
            )}
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Task</Text>
          <View style={styles.grid}>
            {processes.map((p, i) => {
              const on = procIdx === i;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setProcIdx(i)}
                  style={[styles.taskCard, on ? styles.pickCardOn : styles.pickCardOff]}
                >
                  <Text style={[styles.taskTitle, on && { color: color.white }]}>{p.name}</Text>
                </Pressable>
              );
            })}
            {!loading && processes.length === 0 && (
              <Text style={styles.empty}>No tasks yet. Add them from Assessment items.</Text>
            )}
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Expected level for this role</Text>
          <View style={styles.levelRow}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = expected === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setExpected(n)}
                  style={[styles.levelCell, { backgroundColor: on ? color.accent : color.bg }]}
                >
                  <Text style={[styles.levelText, { color: on ? color.white : color.text }]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          label={candidate && process ? `Begin · ${candidate.name.split(' ')[0]} · ${process.name}` : 'Pick auditee and task'}
          onPress={begin}
          disabled={!canBegin}
          loading={starting}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 24 },
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: color.neutral600,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickCard: { minWidth: 150, flexGrow: 1, borderWidth: 2, padding: 12, gap: 3, minHeight: 56 },
  pickCardOn: { backgroundColor: color.text, borderColor: color.text },
  pickCardOff: { backgroundColor: 'transparent', borderColor: color.neutral300 },
  pickTitle: { fontFamily: font.semibold, fontSize: 15, color: color.text },
  pickSub: { fontFamily: font.body, fontSize: 11, color: color.neutral700 },
  taskCard: { minWidth: 150, flexGrow: 1, borderWidth: 2, padding: 13, minHeight: 50, justifyContent: 'center' },
  taskTitle: { fontFamily: font.semibold, fontSize: 14, color: color.text },
  levelRow: { flexDirection: 'row', gap: 2, backgroundColor: color.text, borderWidth: 2, borderColor: color.text },
  levelCell: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  levelText: { fontFamily: font.heading, fontSize: 19 },
  empty: { fontFamily: font.body, fontSize: 13, color: color.neutral600 },
});
