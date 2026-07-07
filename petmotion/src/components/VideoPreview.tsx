import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { colors, radius } from '@/theme';

interface Props {
  uri: string;
  /** Auto-play muted + looping (gallery cards). */
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

/**
 * Muted, looping preview used across the gallery and detail sheets. Pauses
 * automatically when unmounted so we don't leak decoders on scroll.
 */
export function VideoPreview({ uri, autoPlay = true, muted = true, loop = true }: Props) {
  const ref = useRef<Video>(null);

  useEffect(() => {
    return () => {
      ref.current?.unloadAsync().catch(() => {});
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <Video
        ref={ref}
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay={autoPlay}
        isMuted={muted}
        isLooping={loop}
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
