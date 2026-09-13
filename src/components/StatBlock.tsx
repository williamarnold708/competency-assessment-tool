import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme/tokens';

interface Props {
  label: string;
  value: string | number;
  size?: 'md' | 'lg' | 'xl';
  valueColor?: string;
}

export default function StatBlock({ label, value, size = 'md', valueColor }: Props) {
  const valueSize = size === 'xl' ? 64 : size === 'lg' ? 40 : 26;
  return (
    <View>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, { fontSize: valueSize, color: valueColor ?? color.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: font.semibold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: color.neutral600,
  },
  value: {
    fontFamily: font.heading,
    marginTop: 6,
  },
});
