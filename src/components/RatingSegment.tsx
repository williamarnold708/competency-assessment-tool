import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme/tokens';
import { RatingValue } from '../types';

const OPTS: { k: RatingValue; label: string; fill: string }[] = [
  { k: 'c', label: 'Correct', fill: color.text },
  { k: 'p', label: 'Partial', fill: color.neutral700 },
  { k: 'x', label: 'Incorrect', fill: color.accent },
  { k: 'n', label: 'N/A', fill: color.neutral500 },
];

interface Props {
  value: RatingValue | undefined;
  onChange: (value: RatingValue | undefined) => void;
}

export default function RatingSegment({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTS.map((opt) => {
        const on = value === opt.k;
        return (
          <Pressable
            key={opt.k}
            onPress={() => onChange(on ? undefined : opt.k)}
            style={[
              styles.opt,
              on
                ? { backgroundColor: opt.fill, borderColor: opt.fill }
                : { backgroundColor: 'transparent', borderColor: color.neutral300 },
            ]}
          >
            <Text style={[styles.label, { color: on ? color.white : color.text }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  opt: {
    flex: 1,
    minHeight: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 11.5,
  },
});
