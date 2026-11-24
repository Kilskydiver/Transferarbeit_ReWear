import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type TextInputInstance } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { useLoginController } from '@/controllers/useLoginController';
import { useTheme } from '@/hooks/use-theme';
import { AppText } from '@/views/components/AppText';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FormField } from '@/views/components/FormField';
import { Icon } from '@/views/components/Icon';
import { PrimaryButton } from '@/views/components/PrimaryButton';
import { Screen } from '@/views/components/Screen';

type LoginViewProps = ReturnType<typeof useLoginController>;

export function LoginView(c: LoginViewProps) {
  const theme = useTheme();
  const passwordRef = useRef<TextInputInstance>(null);

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Icon name="lock" size={28} color={theme.onPrimary} />
          </View>
          <View style={styles.intro}>
            <AppText variant="display" accessibilityRole="header">
              Verkäufer-Login
            </AppText>
            <AppText tone="secondary">
              Melde dich an, um Artikel zu erfassen, Reservationen zu bearbeiten und deine Einnahmen zu sehen.
            </AppText>
          </View>

          <FormField
            label="E-Mail"
            value={c.values.email}
            onChangeText={(t) => c.setField('email', t)}
            error={c.errors.email}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <FormField
            ref={passwordRef}
            label="Passwort"
            value={c.values.password}
            onChangeText={(t) => c.setField('password', t)}
            error={c.errors.password}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={c.submit}
          />

          {c.submitError && <ErrorMessage message={c.submitError} />}

          <PrimaryButton label="Anmelden" onPress={c.submit} loading={c.submitting} />
          <PrimaryButton label="Abbrechen" variant="ghost" onPress={c.cancel} />

          {__DEV__ && (
            <View style={[styles.demo, { backgroundColor: theme.surfaceMuted }]}>
              <AppText variant="small" tone="secondary">
                Demo-Zugang (nur Entwicklung): verkaeufer@rewear.ch · ReWear2026!
              </AppText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four, paddingTop: Spacing.five },
  logo: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: Spacing.two },
  demo: { padding: Spacing.three, borderRadius: Radius.md },
});
