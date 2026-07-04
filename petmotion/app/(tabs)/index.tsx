import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TemplateCard } from '@/components/TemplateCard';
import { useTemplates } from '@/hooks/useTemplates';
import { track } from '@/lib/analytics';
import { colors, radius, spacing } from '@/theme';
import type { Template, TemplateCategory } from '@/types';

const CATEGORIES: (TemplateCategory | 'all')[] = [
  'all',
  'funny',
  'heartwarming',
  'epic',
  'seasonal',
];

export default function Gallery() {
  const router = useRouter();
  const { templates, loading, error, reload } = useTemplates();
  const [filter, setFilter] = useState<TemplateCategory | 'all'>('all');

  const visible = useMemo(
    () => (filter === 'all' ? templates : templates.filter((t) => t.category === filter)),
    [templates, filter],
  );

  const openTemplate = (t: Template) => {
    track('template_open', { template_id: t.id });
    router.push(`/template/${t.id}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn’t load templates.</Text>
        <Pressable onPress={reload} style={styles.retry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setFilter(c)}
              style={[styles.chip, filter === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === c && styles.chipTextActive]}>
                {c === 'all' ? 'All' : c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <TemplateCard template={item} onPress={openTemplate} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No templates in this category yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  filterBar: { paddingVertical: spacing.sm, paddingLeft: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textMuted, textTransform: 'capitalize', fontWeight: '600' },
  chipTextActive: { color: colors.onPrimary },
  grid: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xxl },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
  errorText: { color: colors.text, marginBottom: spacing.md },
  retry: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { color: colors.primary, fontWeight: '700' },
});
