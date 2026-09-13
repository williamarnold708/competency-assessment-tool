import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { Divider } from '../components/ScreenHeader';
import { StatusTag } from '../components/Tag';
import { useAuth } from '../context/AuthContext';
import { formatWhen } from '../lib/format';
import { RootStackParamList } from '../navigation/types';
import { listRecentAudits } from '../services/audits';
import { signOutAuditor } from '../services/auth';
import { Audit } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { auditorName } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const recents = await listRecentAudits(20);
      setAudits(recents);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const weekAgo = Date.now() - 7 * 86400000;
  const thisWeek = audits.filter((a) => a.createdAt >= weekAgo).length;
  const awaitingSignoff = audits.filter((a) => a.status === 'awaiting_signoff').length;
  const belowExpected = audits.filter((a) => a.status === 'signed' && a.awardedLevel < a.expectedLevel).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Quality department</Text>
          <Text style={styles.title}>Lab skill assessment</Text>
        </View>
        <Pressable onPress={signOutAuditor}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <FlatList
        data={audits}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={load}
        ListHeaderComponent={
          <View style={{ gap: 20, marginBottom: 4 }}>
            <Button label="Start new audit" onPress={() => navigation.navigate('NewAuditSetup')} fullWidth />

            <View style={styles.statsRow}>
              {[
                { label: 'This week', value: String(thisWeek) },
                { label: 'Awaiting sign-off', value: String(awaitingSignoff) },
                { label: 'Below expected', value: String(belowExpected) },
              ].map((s) => (
                <View key={s.label} style={styles.statCell}>
                  <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                </View>
              ))}
            </View>

            <View>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionLabel}>Audit history</Text>
                <Pressable onPress={() => navigation.navigate('AdminItemBank')}>
                  <Text style={styles.link}>Assessment items</Text>
                </Pressable>
              </View>
              <Divider />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Record', { auditId: item.id })}>
            <View style={styles.rowTop}>
              <Text style={styles.rowName}>{item.candidateName}</Text>
              <Text style={styles.rowWhen}>{formatWhen(item.createdAt)}</Text>
            </View>
            <View style={styles.rowBottom}>
              <Text style={styles.rowTask} numberOfLines={1}>
                {item.processName}
                {item.status === 'signed' ? ` · Level ${item.awardedLevel} awarded` : ''}
              </Text>
              <StatusTag
                label={item.status === 'signed' ? 'Signed' : item.status === 'awaiting_signoff' ? 'Unsigned' : 'In progress'}
                positive={item.status === 'signed'}
              />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No audits yet — start one above.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderColor: color.text,
    gap: 12,
  },
  kicker: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 2, color: color.neutral600, textTransform: 'uppercase' },
  title: { fontFamily: font.heading, fontSize: 28, color: color.text, marginTop: 8 },
  signOut: { fontFamily: font.semibold, fontSize: 12, color: color.accent700, textTransform: 'uppercase', letterSpacing: 1 },
  content: { padding: 20, gap: 0 },
  statsRow: { flexDirection: 'row', gap: 2, backgroundColor: color.text, borderWidth: 2, borderColor: color.text },
  statCell: { flex: 1, backgroundColor: color.bg, padding: 12 },
  statLabel: { fontFamily: font.semibold, fontSize: 10, letterSpacing: 1, color: color.neutral600 },
  statValue: { fontFamily: font.heading, fontSize: 28, color: color.text, marginTop: 6 },
  historyHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.5, color: color.text, textTransform: 'uppercase' },
  link: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1, color: color.accent700, textTransform: 'uppercase' },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: color.neutral300, gap: 7 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  rowName: { fontFamily: font.semibold, fontSize: 16, color: color.text },
  rowWhen: { fontFamily: font.body, fontSize: 11, color: color.neutral600 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTask: { flex: 1, fontFamily: font.body, fontSize: 13, color: color.neutral700 },
  empty: { fontFamily: font.body, fontSize: 14, color: color.neutral600, paddingVertical: 24, textAlign: 'center' },
});
