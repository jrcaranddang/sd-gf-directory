import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { track } from '@/lib/analytics';
import { colors, spacing } from '@/theme';
import { ONBOARDED_KEY } from '@/lib/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'pick',
    emoji: '🎬',
    title: 'Pick a template',
    body: 'Dozens of fun, heartwarming, and epic scenes ready for your pet.',
  },
  {
    key: 'upload',
    emoji: '📸',
    title: 'Upload one photo',
    body: 'Any clear photo of your dog, cat, or critter works great.',
  },
  {
    key: 'share',
    emoji: '✨',
    title: 'Get a shareable video',
    body: 'An AI video with audio in under 2 minutes. Save it. Post it.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    track('onboarding_complete');
    router.replace('/(tabs)');
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      void finish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={index === SLIDES.length - 1 ? 'Get started' : 'Next'} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  emoji: { fontSize: 72, marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  body: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  footer: { padding: spacing.xl },
});
