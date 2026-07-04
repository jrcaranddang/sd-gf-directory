import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useJobPolling } from '@/hooks/useJob';
import { track } from '@/lib/analytics';
import { colors, spacing } from '@/theme';

const STATUS_MESSAGES = [
  'Teaching your dog to dance…',
  'Warming up the treats…',
  'Adjusting the tiny cape…',
  'Rendering those puppy eyes…',
  'Adding the soundtrack…',
  'Almost show time…',
];

export default function Generating() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const { job, error, isTerminal } = useJobPolling(jobId);
  const [msgIndex, setMsgIndex] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    const rotate = setInterval(
      () => setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length),
      3000,
    );
    return () => clearInterval(rotate);
  }, [spin]);

  useEffect(() => {
    if (job?.status === 'succeeded') {
      track('job_succeeded', { job_id: jobId });
      router.replace(`/result/${jobId}`);
    } else if (job?.status === 'failed') {
      track('job_failed', { job_id: jobId, error: job.error });
    }
  }, [job?.status, jobId, job?.error, router]);

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (error || job?.status === 'failed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emoji}>😿</Text>
          <Text style={styles.title}>Generation failed</Text>
          <Text style={styles.sub}>
            {job?.error ?? error ?? 'Something went wrong.'} This one didn’t count
            against your quota.
          </Text>
          <Button label="Try again" onPress={() => router.replace('/(tabs)')} style={styles.btn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Animated.Text style={[styles.spinner, { transform: [{ rotate: rotation }] }]}>
          🐾
        </Animated.Text>
        <Text style={styles.title}>{STATUS_MESSAGES[msgIndex]}</Text>
        <Text style={styles.sub}>
          This takes 30–120 seconds. You can leave — we’ll notify you when it’s
          ready.
        </Text>
        {isTerminal ? null : (
          <Button
            label="Notify me & go home"
            variant="secondary"
            onPress={() => router.replace('/(tabs)')}
            style={styles.btn}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  spinner: { fontSize: 64, marginBottom: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  sub: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  btn: { marginTop: spacing.xxl, alignSelf: 'stretch' },
});
