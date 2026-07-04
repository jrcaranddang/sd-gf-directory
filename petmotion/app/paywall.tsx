import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Button } from '@/components/Button';
import { getDefaultOffering, hasProEntitlement } from '@/lib/revenuecat';
import { beginGeneration } from '@/lib/generate';
import { track } from '@/lib/analytics';
import { colors, radius, spacing } from '@/theme';

const BENEFITS = [
  '🎬 Unlimited templates & styles',
  '⚡ Fast AI videos with audio',
  '💧 No watermark — clean exports',
];

export default function Paywall() {
  const router = useRouter();
  const { templateId, imageUri } = useLocalSearchParams<{
    templateId?: string;
    imageUri?: string;
  }>();

  const [weekly, setWeekly] = useState<PurchasesPackage | null>(null);
  const [annual, setAnnual] = useState<PurchasesPackage | null>(null);
  const [selected, setSelected] = useState<'weekly' | 'annual'>('weekly');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);

  useEffect(() => {
    track('paywall_view', { template_id: templateId });
    (async () => {
      const offering = await getDefaultOffering();
      setWeekly(offering?.weekly ?? offering?.availablePackages[0] ?? null);
      setAnnual(offering?.annual ?? offering?.availablePackages[1] ?? null);
      setLoading(false);
    })();
  }, [templateId]);

  const onSubscribed = async () => {
    track('purchase_complete', { plan: selected });
    // If we came from upload with a pending image, start the job now so the
    // purchase flows straight into a generation (spec §1 highest-intent moment).
    if (templateId && imageUri) {
      try {
        const jobId = await beginGeneration({
          templateId,
          uri: decodeURIComponent(imageUri),
        });
        router.replace(`/generating/${jobId}`);
        return;
      } catch {
        // fall through — user can retry Generate from upload
      }
    }
    router.back();
  };

  const purchase = async (pkg: PurchasesPackage | null) => {
    if (!pkg) return;
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (hasProEntitlement(customerInfo)) {
        if (pkg.packageType === 'WEEKLY') track('trial_start');
        await onSubscribed();
      }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        Alert.alert('Purchase failed', err.message ?? 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const dismiss = () => {
    track('paywall_dismiss');
    // One-time abandonment offer: annual discount (spec §1).
    if (annual && !showAbandon) {
      track('abandonment_offer_view');
      setShowAbandon(true);
      return;
    }
    router.back();
  };

  const restore = async () => {
    const info = await Purchases.restorePurchases();
    if (hasProEntitlement(info)) {
      track('purchase_restore', { pro: true });
      await onSubscribed();
    } else {
      Alert.alert('Nothing to restore');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.close} onPress={dismiss} hitSlop={12}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.title}>Bring your pet to life</Text>
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <Text key={b} style={styles.benefit}>
              {b}
            </Text>
          ))}
        </View>

        <PlanOption
          label="Weekly"
          price={weekly?.product.priceString ?? '$6.99'}
          sub="3-day free trial, then billed weekly"
          selected={selected === 'weekly'}
          onPress={() => setSelected('weekly')}
        />
        <PlanOption
          label="Annual"
          price={annual?.product.priceString ?? '$39.99'}
          sub="Best value — billed yearly"
          selected={selected === 'annual'}
          onPress={() => setSelected('annual')}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={selected === 'weekly' ? 'Start free trial' : 'Continue'}
          loading={purchasing}
          onPress={() => purchase(selected === 'weekly' ? weekly : annual)}
        />
        <View style={styles.legalRow}>
          <Pressable onPress={restore}>
            <Text style={styles.legalLink}>Restore</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://petmotion.app/terms')}>
            <Text style={styles.legalLink}>Terms</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://petmotion.app/privacy')}>
            <Text style={styles.legalLink}>Privacy</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={showAbandon} transparent animationType="slide" onRequestClose={() => router.back()}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Wait — special offer 🎁</Text>
            <Text style={styles.sheetBody}>
              Get a full year for {annual?.product.priceString ?? '$39.99'} — less than {' '}
              {weekly?.product.priceString ?? '$6.99'}/week for two months.
            </Text>
            <Button
              label="Get annual deal"
              loading={purchasing}
              onPress={() => {
                setSelected('annual');
                void purchase(annual);
              }}
            />
            <Pressable style={styles.sheetDismiss} onPress={() => router.back()}>
              <Text style={styles.legalLink}>No thanks</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PlanOption({
  label,
  price,
  sub,
  selected,
  onPress,
}: {
  label: string;
  price: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.plan, selected && styles.planSelected]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.planLabel}>{label}</Text>
        <Text style={styles.planSub}>{sub}</Text>
      </View>
      <Text style={styles.planPrice}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  close: { position: 'absolute', top: spacing.xxl, right: spacing.lg, zIndex: 10 },
  closeText: { color: colors.textMuted, fontSize: 22 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center' },
  benefits: { marginVertical: spacing.xl, gap: spacing.md },
  benefit: { color: colors.text, fontSize: 16, textAlign: 'center' },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  planSelected: { borderColor: colors.primary, backgroundColor: colors.surface },
  planLabel: { color: colors.text, fontSize: 17, fontWeight: '700' },
  planSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  planPrice: { color: colors.text, fontSize: 17, fontWeight: '800' },
  footer: { padding: spacing.xl },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.lg },
  legalLink: { color: colors.textFaint, fontSize: 13 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  sheetBody: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.lg,
    lineHeight: 22,
  },
  sheetDismiss: { alignItems: 'center', paddingVertical: spacing.lg },
});
