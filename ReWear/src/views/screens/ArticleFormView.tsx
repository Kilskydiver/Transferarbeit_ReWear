import { Image } from 'expo-image';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { useArticleFormController } from '@/controllers/useArticleFormController';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES, COLORS, CONDITIONS, DEPARTMENTS, USAGES } from '@/models/catalog';
import { AppText } from '@/views/components/AppText';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FormField } from '@/views/components/FormField';
import { Icon } from '@/views/components/Icon';
import { LoadingState } from '@/views/components/LoadingState';
import { OptionGroup } from '@/views/components/OptionGroup';
import { PrimaryButton } from '@/views/components/PrimaryButton';
import { Screen } from '@/views/components/Screen';
import { ScreenHeader } from '@/views/components/ScreenHeader';

type ArticleFormViewProps = ReturnType<typeof useArticleFormController> & { asTab?: boolean };

export function ArticleFormView(c: ArticleFormViewProps) {
  const theme = useTheme();
  const edges = c.asTab ? (['top'] as const) : (['bottom'] as const);

  if (!c.isSeller) {
    return (
      <Screen edges={[...edges]}>
        <EmptyState
          icon="lock"
          title="Nur für den Verkäufer"
          message="Bitte melde dich an, um Artikel zu erfassen."
          actionLabel="Zum Login"
          onAction={c.login}
        />
      </Screen>
    );
  }
  if (c.loading) return <LoadingState />;

  return (
    <Screen edges={[...edges]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {c.asTab && (
            <ScreenHeader
              eyebrow="Verkäufer"
              title="Neuer Artikel"
              subtitle="Foto aufnehmen, Angaben erfassen, fertig."
            />
          )}

          {/* Foto */}
          <View style={styles.section}>
            <AppText variant="small" style={styles.label}>
              Foto
            </AppText>
            <View style={[styles.photo, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
              {c.values.imageUrl ? (
                <>
                  <Image
                    source={{ uri: c.values.imageUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    accessibilityLabel="Vorschau des Artikelfotos"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Foto entfernen"
                    onPress={c.removeImage}
                    style={[styles.removePhoto, { backgroundColor: theme.surface }]}>
                    <Icon name="close" size={14} />
                  </Pressable>
                </>
              ) : (
                <View style={styles.photoEmpty}>
                  <Icon name="camera" size={34} color={theme.textSecondary} />
                  <AppText variant="small" tone="secondary" style={styles.center}>
                    Noch kein Foto. Ohne Foto wird ein Platzhalter angezeigt.
                  </AppText>
                </View>
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.flex}>
                <PrimaryButton label="Kamera" icon="camera" variant="secondary" compact onPress={() => c.pickImage('camera')} />
              </View>
              <View style={styles.flex}>
                <PrimaryButton label="Galerie" icon="photo" variant="secondary" compact onPress={() => c.pickImage('library')} />
              </View>
            </View>
            {c.permissionDenied && (
              <View style={[styles.permission, { backgroundColor: `${theme.warning}1A`, borderColor: `${theme.warning}55` }]}>
                <AppText variant="small" style={styles.flex}>
                  Kein Zugriff auf {c.permissionDenied === 'camera' ? 'die Kamera' : 'die Fotos'}. Du kannst den
                  Zugriff in den Einstellungen erlauben oder den Artikel ohne Foto speichern.
                </AppText>
                <Pressable accessibilityRole="button" onPress={c.openSettings} hitSlop={8}>
                  <AppText variant="small" style={[styles.link, { color: theme.primary }]}>
                    Einstellungen
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>

          <FormField
            label="Titel"
            value={c.values.title}
            onChangeText={(t) => c.setText('title', t)}
            error={c.errors.title}
            placeholder="z. B. Nike Air Max 90"
            maxLength={80}
          />
          <FormField
            label="Marke"
            optional
            value={c.values.brand}
            onChangeText={(t) => c.setText('brand', t)}
            error={c.errors.brand}
            placeholder="z. B. Nike"
            maxLength={40}
          />

          <OptionGroup
            label="Abteilung"
            options={DEPARTMENTS}
            selected={c.values.department}
            onToggle={c.setDepartment}
            error={c.errors.department}
          />
          <OptionGroup
            label="Kategorie"
            options={CATEGORIES}
            selected={c.values.category}
            onToggle={c.setCategory}
            error={c.errors.category}
          />
          {c.values.category && (
            <OptionGroup
              label="Unterkategorie"
              options={c.subcategories.map((s) => ({ key: s, label: s }))}
              selected={c.values.subcategory}
              onToggle={c.setSubcategory}
              error={c.errors.subcategory}
            />
          )}
          {c.values.category && (
            <OptionGroup
              label="Grösse"
              options={c.sizes.map((s) => ({ key: s, label: s }))}
              selected={c.values.size}
              onToggle={c.setSize}
              error={c.errors.size}
            />
          )}
          <OptionGroup
            label="Farbe"
            hint="Hauptfarbe wählen – bei mehreren Farben «Mehrfarbig»."
            options={COLORS.map((col) => ({ key: col.key, label: col.label, swatch: col.hex }))}
            selected={c.values.color}
            onToggle={c.setColor}
            error={c.errors.color}
          />
          <OptionGroup
            label="Zustand"
            options={CONDITIONS}
            selected={c.values.condition}
            onToggle={c.setCondition}
            error={c.errors.condition}
          />
          <OptionGroup
            label="Verwendung"
            hint="Mehrfachauswahl möglich."
            options={USAGES}
            selected={c.values.usage}
            onToggle={c.toggleUsage}
            error={c.errors.usage}
          />

          <FormField
            label="Preis (CHF)"
            value={c.values.price}
            onChangeText={(t) => c.setText('price', t)}
            error={c.errors.price}
            keyboardType="decimal-pad"
            placeholder="45.00"
            maxLength={9}
          />
          <FormField
            label="Beschreibung"
            optional
            multiline
            value={c.values.description}
            onChangeText={(t) => c.setText('description', t)}
            error={c.errors.description}
            placeholder="z. B. Kaum getragen, Originalkarton vorhanden."
            maxLength={1000}
          />

          {c.submitError && <ErrorMessage message={c.submitError} />}

          <PrimaryButton
            label={c.isEdit ? 'Änderungen speichern' : 'Artikel veröffentlichen'}
            icon="check"
            onPress={c.submit}
            loading={c.saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four - 4, paddingTop: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  section: { gap: Spacing.two },
  label: { fontWeight: '600' },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3.4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  removePhoto: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: Spacing.two },
  permission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  link: { fontWeight: '700', textDecorationLine: 'underline' },
  center: { textAlign: 'center' },
});
