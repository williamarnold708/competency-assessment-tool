import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../navigation/types';
import { addItem, listItemsForProcess } from '../services/items';
import { color, font } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminBulkAddItems'>;

export default function AdminBulkAddItemsScreen({ route, navigation }: Props) {
  const { processId, section } = route.params;
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [critical, setCritical] = useState(false);
  const [saving, setSaving] = useState(false);

  const lines = useMemo(() => text.split('\n').map((l) => l.trim()).filter(Boolean), [text]);

  async function save() {
    if (lines.length === 0) return;
    setSaving(true);
    try {
      const existing = await listItemsForProcess(processId);
      let order = existing.filter((i) => i.section === section).length;
      for (const line of lines) {
        await addItem({ processId, section, text: line, category: category.trim() || 'General', critical, order });
        order += 1;
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={section === 'kp' ? 'Add knowledge items' : 'Add troubleshooting questions'} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          {section === 'ts'
            ? 'One question per line — write them against the scenario you set on the task screen. Category and Critical below apply to every line; fine-tune individual items afterward.'
            : 'One item per line — paste or type a whole list at once. Category and Critical below apply to every line; you can fine-tune individual items afterward from the task screen.'}
        </Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{section === 'ts' ? 'Questions' : 'Items'} ({lines.length})</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={text}
            onChangeText={setText}
            placeholder={
              section === 'ts'
                ? 'What would you check first, and why?\nHow would you confirm that diagnosis before acting on it?\n...'
                : 'Confirms sample identity against the batch record\nExplains the spectrophotometer blanking procedure\n...'
            }
            multiline
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category (applies to all lines above)</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Safety" />
        </View>

        <Pressable style={styles.checkRow} onPress={() => setCritical((c) => !c)}>
          <View style={[styles.checkbox, critical && { backgroundColor: color.accent, borderColor: color.accent }]} />
          <Text style={styles.checkLabel}>Mark all as critical</Text>
        </Pressable>

        <Button
          label={
            lines.length > 1
              ? `Add ${lines.length} ${section === 'ts' ? 'questions' : 'items'}`
              : `Add ${section === 'ts' ? 'question' : 'item'}`
          }
          onPress={save}
          disabled={lines.length === 0}
          loading={saving}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 18 },
  hint: { fontFamily: font.body, fontSize: 13, color: color.neutral700, lineHeight: 19 },
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
  textArea: { minHeight: 160, textAlignVertical: 'top' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: color.neutral400 },
  checkLabel: { fontFamily: font.semibold, fontSize: 14, color: color.text },
});
