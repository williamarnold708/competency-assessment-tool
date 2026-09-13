import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { formatFullDate } from '../lib/format';
import { RootStackParamList } from '../navigation/types';
import { getAudit, signAudit } from '../services/audits';
import { Audit } from '../types';
import { color, font, formatSignedTime, ORG_TIMEZONE_LABEL } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Signoff'>;

const HOLD_MS = 900;

export default function SignoffScreen({ route, navigation }: Props) {
  const { auditId } = route.params;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [signedAt, setSignedAt] = useState<number | null>(null);
  const fill = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const a = await getAudit(auditId);
      if (!a) return;
      setAudit(a);
      setSignedAt(a.signedAt);
      setLoading(false);
    })();
  }, [auditId]);

  function holdStart() {
    setHolding(true);
    fill.setValue(0);
    Animated.timing(fill, { toValue: 1, duration: HOLD_MS, useNativeDriver: false }).start();
    holdTimer.current = setTimeout(async () => {
      setHolding(false);
      if (!audit) return;
      const at = await signAudit(auditId, audit.candidateName);
      setSignedAt(at);
    }, HOLD_MS);
  }

  function holdEnd() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setHolding(false);
    fill.stopAnimation();
    fill.setValue(0);
  }

  if (loading || !audit) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 60 }} color={color.text} />
      </SafeAreaView>
    );
  }

  const gap = audit.awardedLevel - audit.expectedLevel;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Sign-off" onBack={() => navigation.goBack()} />
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardKicker}>HANDING OVER TO</Text>
          <Text style={styles.cardName}>{audit.candidateName}</Text>
          <Text style={styles.cardBody}>
            You are confirming you observed this assessment and agree the result recorded above. Awarded level{' '}
            {audit.awardedLevel} against an expected {audit.expectedLevel}
            {gap < 0 ? ` (${gap})` : ''}.
          </Text>
        </View>

        {!signedAt ? (
          <View style={{ gap: 10 }}>
            <Pressable onPressIn={holdStart} onPressOut={holdEnd} style={styles.confirmBtn}>
              {holding && (
                <Animated.View
                  style={[
                    styles.confirmFill,
                    {
                      width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    },
                  ]}
                />
              )}
              <Text style={styles.confirmLabel}>{holding ? 'Keep holding…' : 'Hold to confirm'}</Text>
            </Pressable>
            <Text style={styles.hint}>Press and hold for one second — stops an accidental tap locking the record.</Text>
          </View>
        ) : (
          <View style={{ gap: 20 }}>
            <View style={styles.signedCard}>
              <Text style={styles.signedTitle}>✓ Auditee confirmed</Text>
              <Text style={styles.signedTime}>{formatSignedTime(new Date(signedAt))}</Text>
              <Text style={styles.signedDate}>
                {formatFullDate(signedAt)} · {ORG_TIMEZONE_LABEL}
              </Text>
              <Text style={styles.signedNote}>
                Recorded against this audit only. Signed by {audit.candidateName} on this device. Locked — reopening
                needs a supervisor.
              </Text>
            </View>
            <Button label="Done — back to home" variant="secondary" onPress={() => navigation.popToTop()} fullWidth />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 20 },
  card: { borderWidth: 2, borderColor: color.text, padding: 16, gap: 8 },
  cardKicker: { fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 1.5, color: color.neutral600 },
  cardName: { fontFamily: font.heading, fontSize: 24, color: color.text },
  cardBody: { fontFamily: font.body, fontSize: 13, color: color.neutral700, lineHeight: 19 },
  confirmBtn: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 72,
    backgroundColor: color.accent,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  confirmFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: color.accent700 },
  confirmLabel: { fontFamily: font.semibold, fontSize: 18, color: color.white },
  hint: { fontFamily: font.body, fontSize: 12, color: color.neutral600 },
  signedCard: { borderWidth: 2, borderColor: color.text, backgroundColor: color.text, padding: 16, gap: 4 },
  signedTitle: { fontFamily: font.semibold, fontSize: 15, color: color.bg },
  signedTime: { fontFamily: font.heading, fontSize: 30, color: color.bg, marginTop: 10 },
  signedDate: { fontFamily: font.semibold, fontSize: 12, color: color.bg, opacity: 0.75, marginTop: 2 },
  signedNote: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.bg,
    opacity: 0.75,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(243,242,242,0.3)',
    lineHeight: 17,
  },
});
