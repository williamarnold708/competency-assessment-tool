import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ProgressCells from '../components/ProgressCells';
import RatingSegment from '../components/RatingSegment';
import ScreenHeader from '../components/ScreenHeader';
import { CategoryLabel, CriticalTag } from '../components/Tag';
import { awardedLevel, ratedCount as countRated, scoreSection } from '../lib/scoring';
import { RootStackParamList } from '../navigation/types';
import { completeKpSection, completeTsSection, getAudit, setRating } from '../services/audits';
import { listItems } from '../services/items';
import { getProcess } from '../services/processes';
import { Audit, ChecklistItem, RatingValue } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

export default function ChecklistScreen({ route, navigation }: Props) {
  const { auditId, section } = route.params;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [ratings, setRatings] = useState<Record<string, RatingValue>>({});
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    (async () => {
      const a = await getAudit(auditId);
      if (!a) return;
      const its = await listItems(a.processId, section);
      setAudit(a);
      setItems(its);
      setRatings(a.ratings);
      if (section === 'ts') {
        const process = await getProcess(a.processId);
        setScenario(process?.scenario ?? '');
      }
      setLoading(false);
    })();
  }, [auditId, section]);

  const done = useMemo(() => countRated(items, ratings), [items, ratings]);
  const allDone = items.length > 0 && done === items.length;
  const pct = useMemo(() => scoreSection(items, ratings), [items, ratings]);

  function onRate(itemId: string, value: RatingValue | undefined) {
    setRatings((r) => ({ ...r, [itemId]: value as RatingValue }));
    setRating(auditId, itemId, value);
  }

  async function advance() {
    if (!allDone || !audit) return;
    setAdvancing(true);
    try {
      if (section === 'kp') {
        await completeKpSection(auditId, pct, done, items.length);
        navigation.replace('Checklist', { auditId, section: 'ts' });
      } else {
        const awarded = awardedLevel(audit.kpScore, pct);
        await completeTsSection(auditId, pct, awarded, done, items.length);
        navigation.replace('Result', { auditId });
      }
    } finally {
      setAdvancing(false);
    }
  }

  if (loading || !audit) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 60 }} color={color.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={section === 'kp' ? 'Knowledge' : 'Troubleshooting'} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.auditLineRow}>
          <Text style={styles.auditLine}>
            {audit.candidateName} · {audit.processName}
          </Text>
          <Text style={styles.progressLabel}>
            {done} / {items.length} rated
          </Text>
        </View>
        <ProgressCells values={items.map((it) => ratings[it.id])} />

        {section === 'ts' && !!scenario && (
          <View style={styles.scenarioCard}>
            <Text style={styles.scenarioLabel}>Scenario</Text>
            <Text style={styles.scenarioText}>{scenario}</Text>
          </View>
        )}

        <View style={styles.list}>
          {items.map((item, i) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.num}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={styles.rowText}>
                  <Text style={styles.itemText}>{item.text}</Text>
                  <View style={styles.tagRow}>
                    <CategoryLabel text={item.category} />
                    {item.critical && <CriticalTag />}
                  </View>
                </View>
              </View>
              <RatingSegment value={ratings[item.id]} onChange={(v) => onRate(item.id, v)} />
            </View>
          ))}
        </View>

        <Button
          label={
            allDone
              ? section === 'kp'
                ? 'Continue to troubleshooting'
                : 'See result'
              : `Rate all ${items.length} to continue`
          }
          onPress={advance}
          disabled={!allDone}
          loading={advancing}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 14 },
  auditLineRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  auditLine: { fontFamily: font.body, fontSize: 13, color: color.neutral700 },
  progressLabel: { fontFamily: font.semibold, fontSize: 13, color: color.text },
  scenarioCard: { backgroundColor: color.surface, padding: 14, gap: 6 },
  scenarioLabel: { fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 1.2, color: color.neutral600, textTransform: 'uppercase' },
  scenarioText: { fontFamily: font.body, fontSize: 14, color: color.text, lineHeight: 20 },
  list: { borderTopWidth: 2, borderColor: color.text, borderBottomWidth: 2 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: color.neutral300, gap: 10 },
  rowTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  num: { fontFamily: font.semibold, fontSize: 12, color: color.neutral500, minWidth: 22 },
  rowText: { flex: 1, gap: 5 },
  itemText: { fontFamily: font.body, fontSize: 15, color: color.text, lineHeight: 21 },
  tagRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
});
