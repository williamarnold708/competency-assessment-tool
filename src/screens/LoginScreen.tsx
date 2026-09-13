import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import { registerAuditor, signIn } from '../services/auth';
import { color, font } from '../theme/tokens';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Enter your name.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await registerAuditor(email, password, name.trim());
      }
    } catch (e: any) {
      setError(e?.message?.replace('Firebase: ', '') ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.kicker}>Competency Assessment</Text>
          <Text style={styles.title}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
          <View style={styles.rule} />

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" />
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button
            label={mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={submit}
            loading={loading}
            fullWidth
          />
          <Text style={styles.switch} onPress={() => setMode(mode === 'signin' ? 'register' : 'signin')}>
            {mode === 'signin' ? "New auditor? Create an account" : 'Already have an account? Sign in'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
  kicker: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 2, color: color.neutral600, textTransform: 'uppercase' },
  title: { fontFamily: font.heading, fontSize: 30, color: color.text, marginTop: 4 },
  rule: { height: 2, backgroundColor: color.text, marginVertical: 10 },
  field: { gap: 5 },
  fieldLabel: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1, color: color.neutral600, textTransform: 'uppercase' },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
    fontSize: 15,
    color: color.text,
  },
  error: { fontFamily: font.body, fontSize: 13, color: color.accent700 },
  switch: { fontFamily: font.semibold, fontSize: 13, color: color.accent700, marginTop: 8, textAlign: 'center' },
});
