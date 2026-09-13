import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { CriticalTag } from '../components/Tag';
import { RootStackParamList } from '../navigation/types';
import { deleteItem, listItemsForProcess } from '../services/items';
import { deleteProcess } from '../services/processes';
import { ChecklistItem, Section } from '../types';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminTaskDetail'>;

export default function AdminTaskDetailScreen({ route, navigation }: Props) {
  const { processId, processName } = route.params;
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listItemsForProcess(processId));
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

  function renderSection(section: Section, title: string) {
    const sectionItems = items.filter((i) => i.section === section);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>
            {title} · {sectionItems.length}
          </Text>
        </View>
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
        <Button
          label="+ Add items"
          variant="secondary"
          onPress={() => navigation.navigate('AdminBulkAddItems', { processId, section })}
          fullWidth
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={processName} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!loading && (
          <>
            {renderSection('kp', 'Knowledge & practice')}
            {renderSection('ts', 'Technique & skill')}
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
});
