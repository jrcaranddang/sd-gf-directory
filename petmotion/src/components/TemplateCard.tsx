import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VideoPreview } from './VideoPreview';
import { colors, radius, spacing } from '@/theme';
import type { Template } from '@/types';

interface Props {
  template: Template;
  onPress: (template: Template) => void;
}

export function TemplateCard({ template, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Template: ${template.title}`}
      onPress={() => onPress(template)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.preview}>
        <VideoPreview uri={template.preview_url} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {template.title}
      </Text>
      <Text style={styles.category}>{template.category}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  preview: {
    aspectRatio: 9 / 16,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  category: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
