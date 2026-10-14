import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

export function ClipPlayer({
  uri,
  style,
  nativeControls = true,
}: {
  uri: string;
  style?: StyleProp<ViewStyle>;
  nativeControls?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  const player = useVideoPlayer({ uri }, (instance) => {
    instance.loop = true;
  });

  return (
    <View style={[styles.wrap, style]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={nativeControls}
        fullscreenOptions={{ enable: true }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: colors.videoBg,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
