import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { CriticalTag } from '../components/Tag';
import { RootStackParamList } from '../navigation/types';
import { deleteItem, listItemsForProcess } from '../services/items';
import { deleteProcess, getProcess, updateProcessScenario } from '../services/processes';
import { ChecklistItem, Section } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminTaskDetail'>;

export default function AdminTaskDetailScreen({ route, navigation }: Props) {
  const { processId, processName } = route.params;
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [scenario, setScenario] = useState('');
  const [savedScenario, setSavedScenario] = useState('');
  const [savingScenario, setSavingScenario] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [its, process] = await Promise.all([listItemsForProcess(processId), getProcess(processId)]);
      setItems(its);
      setScenario(process?.scenario ?? '');
      setSavedScenario(process?.scenario ?? '');
    } finally {
      setLoading(false);
    }
  }, [processId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onDeleteItem(itemId: string) {
    await deleteItem(itemId);
    load();
  }

  async function onSaveScenario() {
    setSavingScenario(true);
    try {
      await updateProcessScenario(processId, scenario.trim());
      setSavedScenario(scenario.trim());
    } finally {
      setSavingScenario(false);
    }
  }

  function onDeleteTask() {
    Alert.alert('Delete task', `This removes "${processName}" and all its items.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(items.map((it) => deleteItem(it.id)));
          await deleteProcess(processId);
          navigation.goBack();
        },
      },
    ]);
  }

  function renderItemList(section: Section) {
    const sectionItems = items.filter((i) => i.section === section);
    return (
      <>
        {sectionItems.map((it, i) => (
          <Pressable
            key={it.id}
            style={styles.itemRow}
            onPress={() => navigation.navigate('AdminItemForm', { processId, section, itemId: it.id })}
          >
            <Text style={styles.itemNum}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.itemText} numberOfLines={2}>
              {it.text}
            </Text>
            {it.critical && <CriticalTag />}
            <Pressable hitSlop={8} onPress={() => onDeleteItem(it.id)}>
              <Text style={styles.deleteLink}>Delete</Text>
            </Pressable>
          </Pressable>
        ))}
        {sectionItems.length === 0 && <Text style={styles.empty}>No items yet.</Text>}
      </>
    );
  }

  const scenarioDirty = scenario.trim() !== savedScenario;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={processName} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!loading && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  Knowledge & practice · {items.filter((i) => i.section === 'kp').length}
                </Text>
              </View>
              {renderItemList('kp')}
              <Button
                label="+ Add items"
                variant="secondary"
                onPress={() => navigation.navigate('AdminBulkAddItems', { processId, section: 'kp' })}
                fullWidth
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  Troubleshooting · {items.filter((i) => i.section === 'ts').length}
                </Text>
              </View>

              <View style={styles.scenarioBlock}>
                <Text style={styles.scenarioLabel}>Scenario</Text>
                <Text style={styles.scenarioHint}>
                  Describe the situation the candidate is troubleshooting. The questions below are answered against
                  this scenario — auditors see it on the Troubleshooting screen during the audit.
                </Text>
                <TextInput
                  style={[styles.input, styles.scenarioInput]}
                  value={scenario}
                  onChangeText={setScenario}
                  placeholder={'e.g. The IBU result comes back 40% lower than the expected range for this recipe. Walk through how you would identify the cause.'}
                  multiline
                />
                <Button
                  label={savingScenario ? 'Saving…' : 'Save scenario'}
                  variant="secondary"
                  onPress={onSaveScenario}
                  disabled={!scenarioDirty}
                  loading={savingScenario}
                  fullWidth
                />
              </View>

              <Text style={styles.questionsLabel}>Questions based on this scenario</Text>
              {renderItemList('ts')}
              <Button
                label="+ Add questions"
                variant="secondary"
                onPress={() => navigation.navigate('AdminBulkAddItems', { processId, section: 'ts' })}
                fullWidth
              />
            </View>
          </>
        )}
        <Pressable onPress={onDeleteTask}>
          <Text style={styles.deleteTaskLink}>Delete this task</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 28 },
  section: { gap: 8 },
  sectionHeader: { borderBottomWidth: 2, borderColor: color.text, paddingBottom: 8, marginBottom: 4 },
  sectionLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.5, color: color.text, textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderColor: color.neutral300 },
  itemNum: { fontFamily: font.semibold, fontSize: 12, color: color.neutral500, minWidth: 20 },
  itemText: { flex: 1, fontFamily: font.body, fontSize: 14, color: color.text },
  deleteLink: { fontFamily: font.semibold, fontSize: 12, color: color.accent700 },
  empty: { fontFamily: font.body, fontSize: 13, color: color.neutral600, paddingVertical: 8 },
  deleteTaskLink: { fontFamily: font.semibold, fontSize: 13, color: color.accent700, textAlign: 'center' },
  scenarioBlock: { backgroundColor: color.surface, padding: 14, gap: 8, marginBottom: 4 },
  scenarioLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1, color: color.text, textTransform: 'uppercase' },
  scenarioHint: { fontFamily: font.body, fontSize: 12, color: color.neutral700, lineHeight: 17 },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
  },
  scenarioInput: { minHeight: 90, textAlignVertical: 'top' },
  questionsLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1, color: color.neutral600, textTransform: 'uppercase', marginTop: 4 },
});
