import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme/tokens';

interface Props {
  title: string;
  onBack?: () => void;
}

export default function ScreenHeader({ title, onBack }: Props) {
  return (
    <View>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.rule} />
    </View>
  );
}

export function Divider() {
  return <View style={styles.rule} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36 },
  backBtn: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { fontSize: 20, color: color.text, marginTop: -2 },
  title: { flex: 1, fontFamily: font.heading, fontSize: 23, color: color.text },
  rule: { height: 2, backgroundColor: color.text, marginTop: 12 },
});
