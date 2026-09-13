import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme/tokens';

export function CriticalTag() {
  return (
    <View style={[styles.base, { backgroundColor: color.accent }]}>
      <Text style={[styles.label, { color: color.white }]}>Critical</Text>
    </View>
  );
}

export function CategoryLabel({ text }: { text: string }) {
  return <Text style={styles.category}>{text.toUpperCase()}</Text>;
}

export function StatusTag({ label, positive }: { label: string; positive: boolean }) {
  return (
    <View style={[styles.base, { backgroundColor: positive ? color.text : color.accent }]}>
      <Text style={[styles.label, { color: color.white }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 9.5,
    letterSpacing: 0.6,
  },
  category: {
    fontFamily: font.semibold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: color.neutral600,
  },
});
