import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { audioSource } from '@/lib/media';
import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';

export function AudioPlayer({ uri }: { uri: string }) {
  const styles = useThemedStyles(createStyles);
  const source = audioSource(uri);
  const player = useAudioPlayer(source ?? null);
  const status = useAudioPlayerStatus(player);

  if (!source) return null;

  const playing = status.playing;
  const duration = status.duration || 0;
  const current = status.currentTime || 0;

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.btn}
        onPress={() => {
          if (playing) {
            player.pause();
          } else {
            if (duration > 0 && current >= duration - 0.15) {
              player.seekTo(0);
            }
            player.play();
          }
        }}>
        <Text style={styles.btnText}>{playing ? 'Pause' : 'Play voice note'}</Text>
      </Pressable>
      <Text style={styles.time}>
        {formatTime(current)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnText: {
    color: colors.cream,
    fontWeight: '700',
    fontSize: 14,
  },
  time: {
    color: colors.muted,
    fontSize: 13,
  },
});
