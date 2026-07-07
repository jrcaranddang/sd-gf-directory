import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { useTemplate } from '@/hooks/useTemplates';
import { useEntitlement } from '@/hooks/useEntitlement';
import { beginGeneration } from '@/lib/generate';
import { ApiRequestError } from '@/lib/api';
import { track } from '@/lib/analytics';
import { colors, radius, spacing } from '@/theme';

const MIN_DIMENSION = 512; // spec §3

interface Picked {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
}

export default function Upload() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const router = useRouter();
  const { template } = useTemplate(templateId);
  const { isPro } = useEntitlement();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [busy, setBusy] = useState(false);

  const aspect: [number, number] =
    template?.aspect_ratio === '1:1' ? [1, 1] : [9, 16];

  const validateAndSet = (asset: ImagePicker.ImagePickerAsset) => {
    if (asset.width < MIN_DIMENSION || asset.height < MIN_DIMENSION) {
      Alert.alert(
        'Photo too small',
        `Please choose a photo at least ${MIN_DIMENSION}px on each side for the best result.`,
      );
      return;
    }
    setPicked({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
    });
    track('photo_selected', { template_id: templateId });
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect,
      quality: 0.9,
    });
    if (!result.canceled) validateAndSet(result.assets[0]);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 0.9,
    });
    if (!result.canceled) validateAndSet(result.assets[0]);
  };

  const onGenerate = async () => {
    if (!picked || !templateId) return;
    track('generate_tapped', { template_id: templateId });

    // Client-side entitlement shortcut → paywall at the moment of highest
    // intent (spec §1). Server re-verifies in create-job regardless.
    if (!isPro) {
      router.push(`/paywall?templateId=${templateId}&imageUri=${encodeURIComponent(picked.uri)}`);
      return;
    }

    await startGeneration();
  };

  const startGeneration = async () => {
    if (!picked || !templateId) return;
    setBusy(true);
    try {
      const jobId = await beginGeneration({
        templateId,
        uri: picked.uri,
        mimeType: picked.mimeType,
      });
      router.replace(`/generating/${jobId}`);
    } catch (e) {
      if (e instanceof ApiRequestError && e.code === 'PAYWALL') {
        router.push(`/paywall?templateId=${templateId}`);
      } else if (e instanceof ApiRequestError && (e.code === 'QUOTA' || e.code === 'DAILY_CAP')) {
        Alert.alert('Limit reached', e.message);
      } else {
        Alert.alert('Something went wrong', e instanceof Error ? e.message : 'Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.previewBox}>
        {picked ? (
          <Image source={{ uri: picked.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🐶</Text>
            <Text style={styles.guidance}>
              Choose a clear photo where your pet’s face is visible.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button label="Camera roll" variant="secondary" onPress={pickFromLibrary} />
        <View style={{ height: spacing.sm }} />
        <Button label="Take a photo" variant="secondary" onPress={takePhoto} />
        <View style={{ height: spacing.lg }} />
        <Button label="Generate ✨" onPress={onGenerate} disabled={!picked} loading={busy} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  previewBox: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
    marginBottom: spacing.lg,
  },
  preview: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  placeholderEmoji: { fontSize: 64, marginBottom: spacing.md },
  guidance: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
  actions: {},
});
