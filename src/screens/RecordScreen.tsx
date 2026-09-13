import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { formatFullDate, formatWhen } from '../lib/format';
import { RootStackParamList } from '../navigation/types';
import { getAudit } from '../services/audits';
import { Audit } from '../types';
import { color, font, formatSignedTime, ORG_TIMEZONE_LABEL } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Record'>;

export default function RecordScreen({ route, navigation }: Props) {
  const { auditId } = route.params;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const a = await getAudit(auditId);
      setAudit(a);
      setLoading(false);
    })();
  }, [auditId]);

  if (loading || !audit) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 60 }} color={color.text} />
      </SafeAreaView>
    );
  }

  const stats = [
    { label: 'K&P', value: `${audit.kpScore}%` },
    { label: 'TS', value: `${audit.tsScore}%` },
    { label: 'Awarded', value: String(audit.awardedLevel) },
    { label: 'Expected', value: String(audit.expectedLevel) },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Record" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.line}>
          <Text style={styles.lineText}>
            {audit.candidateName} · {audit.processName} · {formatFullDate(audit.createdAt)}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text style={styles.sectionLabel}>Audit trail</Text>
          <View style={styles.trail}>
            {audit.trail.map((t, i) => (
              <View key={i} style={styles.trailRow}>
                <Text style={styles.trailTime}>{formatSignedTime(new Date(t.ts))}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trailWhat}>{t.what}</Text>
                  <Text style={styles.trailWho}>{t.who}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.tzNote}>
          All times shown in {ORG_TIMEZONE_LABEL} — stored as a fixed instant, converted for display, so a record
          never changes hour when it syncs.
        </Text>

        {audit.status === 'in_progress' && (
          <Button
            label="Continue audit"
            onPress={() => navigation.navigate('Checklist', { auditId, section: 'kp' })}
            fullWidth
          />
        )}
        {audit.status === 'awaiting_signoff' && (
          <Button label="Continue to sign-off" onPress={() => navigation.navigate('Signoff', { auditId })} fullWidth />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 18 },
  line: { backgroundColor: color.surface, padding: 10 },
  lineText: { fontFamily: font.semibold, fontSize: 13, color: color.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, backgroundColor: color.text, borderWidth: 2, borderColor: color.text },
  statCell: { flexBasis: '50%', flexGrow: 1, backgroundColor: color.bg, padding: 11 },
  statLabel: { fontFamily: font.semibold, fontSize: 10, letterSpacing: 1, color: color.neutral600 },
  statValue: { fontFamily: font.heading, fontSize: 26, color: color.text, marginTop: 6 },
  sectionLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.5, color: color.text, textTransform: 'uppercase', borderBottomWidth: 2, borderColor: color.text, paddingBottom: 8, marginBottom: 4 },
  trail: {},
  trailRow: { flexDirection: 'row', gap: 12, borderBottomWidth: 1, borderColor: color.neutral300, paddingVertical: 12 },
  trailTime: { fontFamily: font.semibold, fontSize: 12, color: color.neutral600, minWidth: 60 },
  trailWhat: { fontFamily: font.semibold, fontSize: 14, color: color.text },
  trailWho: { fontFamily: font.body, fontSize: 12, color: color.neutral700, marginTop: 3 },
  tzNote: { fontFamily: font.body, fontSize: 12, color: color.neutral600, lineHeight: 17 },
});
