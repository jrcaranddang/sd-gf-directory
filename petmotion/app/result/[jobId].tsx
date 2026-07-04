import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Button } from '@/components/Button';
import { getJob } from '@/lib/api';
import { track } from '@/lib/analytics';
import { colors, radius, spacing } from '@/theme';
import type { Job } from '@/types';

const REPORT_EMAIL = 'report@petmotion.app'; // UGC report (spec §5, App Store req)

export default function Result() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (jobId) getJob(jobId).then(setJob).catch(() => {});
  }, [jobId]);

  const videoUrl = job?.output_video_url;

  const save = async () => {
    if (!videoUrl) return;
    setSaving(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to save your video.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(videoUrl);
      track('result_saved', { job_id: jobId });
      Alert.alert('Saved!', 'Your video is in your Photos.');
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    if (!videoUrl) return;
    track('result_shared', { job_id: jobId });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(videoUrl);
    } else {
      Alert.alert('Sharing unavailable on this device');
    }
  };

  if (!job) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.player}>
        {videoUrl ? (
          <Video
            source={{ uri: videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            isLooping
          />
        ) : (
          <Text style={styles.pending}>This video is still processing…</Text>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.row}>
          <Button label="Save" variant="secondary" onPress={save} loading={saving} style={styles.half} />
          <View style={{ width: spacing.md }} />
          <Button label="Share" variant="secondary" onPress={share} style={styles.half} />
        </View>
        <View style={{ height: spacing.md }} />
        <Button label="Make another" onPress={() => router.replace('/(tabs)')} />
        <Text
          style={styles.report}
          onPress={() =>
            Linking.openURL(`mailto:${REPORT_EMAIL}?subject=Report%20video%20${jobId}`)
          }
        >
          Report this content
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  player: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pending: { color: colors.textMuted },
  actions: { padding: spacing.lg },
  row: { flexDirection: 'row' },
  half: { flex: 1 },
  report: { color: colors.textFaint, textAlign: 'center', marginTop: spacing.lg, fontSize: 13 },
});
