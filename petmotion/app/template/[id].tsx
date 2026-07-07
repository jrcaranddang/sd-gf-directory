import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPreview } from '@/components/VideoPreview';
import { Button } from '@/components/Button';
import { useTemplate } from '@/hooks/useTemplates';
import { colors, radius, spacing } from '@/theme';

/**
 * Template detail sheet. Note: the prompt is NOT shown or sent from the client
 * — it lives server-side (spec §5). We only pass template_id forward.
 */
export default function TemplateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { template, loading } = useTemplate(id);

  if (loading || !template) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.hero}>
        <VideoPreview uri={template.preview_url} muted={false} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{template.title}</Text>
        <View style={styles.metaRow}>
          <Pill text={template.category} />
          <Pill text={`${template.duration_seconds}s`} />
          <Pill text={template.aspect_ratio} />
          {template.audio_enabled && <Pill text="🔊 audio" />}
        </View>

        <View style={{ flex: 1 }} />

        <Button
          label="Use this template"
          onPress={() => router.push(`/upload?templateId=${template.id}`)}
        />
      </View>
    </SafeAreaView>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  hero: { flex: 1.4, margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: { color: colors.textMuted, textTransform: 'capitalize', fontSize: 13 },
});
