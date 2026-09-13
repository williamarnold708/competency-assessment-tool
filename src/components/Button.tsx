import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  trailing?: React.ReactNode;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth,
  trailing,
}: Props) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        isPrimary && { backgroundColor: color.accent },
        isSecondary && { borderWidth: 2, borderColor: color.text, backgroundColor: 'transparent' },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        fullWidth && { width: '100%' },
        pressed && !inactive && isPrimary && { backgroundColor: color.accent700 },
        inactive && { opacity: 0.45 },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? color.white : color.text} />
        ) : (
          <Text
            style={[
              styles.label,
              isPrimary && { color: color.white },
              isSecondary && { color: color.text },
              variant === 'ghost' && { color: color.accent },
            ]}
          >
            {label}
          </Text>
        )}
        {trailing}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 16,
  },
});
