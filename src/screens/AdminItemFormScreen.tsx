import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../navigation/types';
import { addItem, listItemsForProcess, updateItem } from '../services/items';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminItemForm'>;

export default function AdminItemFormScreen({ route, navigation }: Props) {
  const { processId, section, itemId } = route.params;
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [critical, setCritical] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    (async () => {
      const items = await listItemsForProcess(processId);
      const item = items.find((i) => i.id === itemId);
      if (item) {
        setText(item.text);
        setCategory(item.category);
        setCritical(item.critical);
      }
    })();
  }, [itemId, processId]);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (itemId) {
        await updateItem(itemId, { text: text.trim(), category: category.trim() || 'General', critical });
      } else {
        const existing = await listItemsForProcess(processId);
        const order = existing.filter((i) => i.section === section).length;
        await addItem({ processId, section, text: text.trim(), category: category.trim() || 'General', critical, order });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={itemId ? 'Edit item' : 'Add item'} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Item text</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={text}
            onChangeText={setText}
            placeholder="e.g. Confirms sample identity against the batch record"
            multiline
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Safety" />
        </View>
        <Pressable style={styles.checkRow} onPress={() => setCritical((c) => !c)}>
          <View style={[styles.checkbox, critical && { backgroundColor: color.accent, borderColor: color.accent }]} />
          <Text style={styles.checkLabel}>Critical item</Text>
        </Pressable>

        <Button label={itemId ? 'Save changes' : 'Add item'} onPress={save} loading={saving} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 18 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1, color: color.neutral600, textTransform: 'uppercase' },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
    fontSize: 15,
    color: color.text,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: color.neutral400 },
  checkLabel: { fontFamily: font.semibold, fontSize: 14, color: color.text },
});
