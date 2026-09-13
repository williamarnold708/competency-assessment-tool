import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import StatBlock from '../components/StatBlock';
import { criticalFailCount } from '../lib/scoring';
import { RootStackParamList } from '../navigation/types';
import { getAudit } from '../services/audits';
import { listItems } from '../services/items';
import { Audit, ChecklistItem } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { auditId } = route.params;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [kpItems, setKpItems] = useState<ChecklistItem[]>([]);
  const [tsItems, setTsItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const a = await getAudit(auditId);
      if (!a) return;
      const [kp, ts] = await Promise.all([listItems(a.processId, 'kp'), listItems(a.processId, 'ts')]);
      setAudit(a);
      setKpItems(kp);
      setTsItems(ts);
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

  const gapValue = audit.awardedLevel - audit.expectedLevel;
  const gapText = gapValue > 0 ? `+${gapValue}` : String(gapValue);
  const gapColor = gapValue < 0 ? color.accent : color.text;
  const kpCorrect = kpItems.filter((it) => audit.ratings[it.id] === 'c').length;
  const tsCorrect = tsItems.filter((it) => audit.ratings[it.id] === 'c').length;
  const critFails = criticalFailCount(kpItems, audit.ratings) + criticalFailCount(tsItems, audit.ratings);
  const naCount = Object.values(audit.ratings).filter((v) => v === 'n').length;

  const breakdown = [
    { label: 'Knowledge items rated correct', value: `${kpCorrect} of ${kpItems.length}`, danger: false },
    { label: 'Technique items rated correct', value: `${tsCorrect} of ${tsItems.length}`, danger: false },
    { label: 'Critical items failed', value: String(critFails), danger: true },
    { label: 'Marked not applicable', value: String(naCount), danger: false },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Result" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.auditLine}>
          <Text style={styles.auditLineText}>
            {audit.candidateName} · {audit.processName}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCell}>
            <StatBlock label="K&P score" value={`${audit.kpScore}%`} size="lg" />
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${audit.kpScore}%` }]} />
            </View>
          </View>
          <View style={styles.scoreCell}>
            <StatBlock label="TS score" value={`${audit.tsScore}%`} size="lg" />
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${audit.tsScore}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.awardRow}>
          <StatBlock label="Awarded level" value={audit.awardedLevel} size="xl" valueColor={gapValue < 0 ? color.accent : color.text} />
          <View style={styles.awardGrid}>
            <View style={styles.awardCell}>
              <Text style={styles.awardLabel}>EXPECTED</Text>
              <Text style={styles.awardValue}>{audit.expectedLevel}</Text>
            </View>
            <View style={styles.awardCell}>
              <Text style={styles.awardLabel}>GAP</Text>
              <Text style={[styles.awardValue, { color: gapColor }]}>{gapText}</Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Where the marks went</Text>
          <View style={styles.breakdownList}>
            {breakdown.map((b) => (
              <View key={b.label} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{b.label}</Text>
                <Text style={[styles.breakdownValue, { color: b.danger ? color.accent : color.text }]}>{b.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button label="Hand over for sign-off" onPress={() => navigation.navigate('Signoff', { auditId })} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 22 },
  auditLine: { backgroundColor: color.surface, padding: 10 },
  auditLineText: { fontFamily: font.semibold, fontSize: 13, color: color.text },
  scoreRow: { flexDirection: 'row', gap: 18 },
  scoreCell: { flex: 1 },
  bar: { height: 6, backgroundColor: color.neutral300, marginTop: 10 },
  barFill: { height: 6, backgroundColor: color.text },
  awardRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 20, borderTopWidth: 2, borderColor: color.text, paddingTop: 16, flexWrap: 'wrap' },
  awardGrid: { flexDirection: 'row', gap: 2, backgroundColor: color.text, borderWidth: 2, borderColor: color.text, flex: 1, minWidth: 160 },
  awardCell: { flex: 1, backgroundColor: color.surface, padding: 10 },
  awardLabel: { fontFamily: font.semibold, fontSize: 10, letterSpacing: 1, color: color.neutral600 },
  awardValue: { fontFamily: font.heading, fontSize: 28, marginTop: 6, color: color.text },
  sectionLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.5, color: color.text, textTransform: 'uppercase', borderBottomWidth: 2, borderColor: color.text, paddingBottom: 8, marginBottom: 4 },
  breakdownList: {},
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: color.neutral300, paddingVertical: 11 },
  breakdownLabel: { flex: 1, fontFamily: font.body, fontSize: 14, color: color.text },
  breakdownValue: { fontFamily: font.semibold, fontSize: 14 },
});
