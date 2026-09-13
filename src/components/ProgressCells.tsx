import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color } from '../theme/tokens';
import { RatingValue } from '../types';

export default function ProgressCells({ values }: { values: (RatingValue | undefined)[] }) {
  return (
    <View style={styles.row}>
      {values.map((v, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            {
              backgroundColor:
                v === undefined ? color.neutral300 : v === 'x' ? color.accent : v === 'p' ? color.neutral500 : color.text,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2, height: 8 },
  cell: { flex: 1 },
});
