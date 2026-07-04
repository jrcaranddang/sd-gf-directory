import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useEntitlement } from '@/hooks/useEntitlement';
import { restorePurchases } from '@/lib/revenuecat';
import { track } from '@/lib/analytics';
import { colors, radius, spacing } from '@/theme';
import type { Job } from '@/types';

const SUPPORT_EMAIL = 'support@petmotion.app';

function statusColor(status: Job['status']): string {
  if (status === 'succeeded') return colors.success;
  if (status === 'failed') return colors.danger;
  return colors.textFaint;
}

export default function History() {
  const router = useRouter();
  const { isPro } = useEntitlement();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // RLS ensures a user only sees their own jobs.
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    setJobs((data ?? []) as Job[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const onRestore = async () => {
    try {
      const pro = await restorePurchases();
      track('purchase_restore', { pro });
      Alert.alert(pro ? 'Purchases restored' : 'Nothing to restore');
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    }
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, videos, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Handled by a `delete-account` Edge Function (service-role) that
            // removes storage + rows + auth user. Client just invokes it.
            await supabase.functions.invoke('delete-account');
            await supabase.auth.signOut();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={jobs}
      keyExtractor={(j) => j.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Subscription</Text>
            <View style={[styles.badge, isPro && styles.badgePro]}>
              <Text style={[styles.badgeText, isPro && styles.badgeTextPro]}>
                {isPro ? 'PRO' : 'Free'}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Your videos</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.jobRow}
          disabled={item.status !== 'succeeded'}
          onPress={() => router.push(`/result/${item.id}`)}
        >
          <View style={[styles.jobDot, { backgroundColor: statusColor(item.status) }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.template_id}</Text>
            <Text style={styles.jobMeta}>
              {item.status} · {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <Text style={styles.empty}>No videos yet. Make your first one!</Text>
        )
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <FooterLink label="Restore purchases" onPress={onRestore} />
          <FooterLink
            label="Contact support"
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
          <FooterLink
            label="Privacy policy"
            onPress={() => Linking.openURL('https://petmotion.app/privacy')}
          />
          <FooterLink
            label="Terms of use"
            onPress={() => Linking.openURL('https://petmotion.app/terms')}
          />
          <FooterLink label="Delete account" destructive onPress={onDeleteAccount} />
        </View>
      }
    />
  );
}

function FooterLink({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.link}>
      <Text style={[styles.linkText, destructive && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  statusLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  badgePro: { backgroundColor: colors.primary },
  badgeText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  badgeTextPro: { color: colors.onPrimary },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xl,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  jobDot: { width: 10, height: 10, borderRadius: 5 },
  jobTitle: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  jobMeta: { color: colors.textMuted, fontSize: 13, textTransform: 'capitalize' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
  footer: { padding: spacing.lg, marginTop: spacing.lg },
  link: { paddingVertical: spacing.md },
  linkText: { color: colors.textMuted, fontSize: 15 },
});
