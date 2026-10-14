import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GreenHero } from '@/components/dumpwatch/GreenHero';
import { useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

export default function PostChooserScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dumpSection}>
          <GreenHero
            kicker="DumpWatch SA"
            title="Illegal dumping"
            subtitle="5-second video, then car, person and plate photos. Camera opens next."
          />

        <Pressable style={styles.dumpCard} onPress={() => router.push('/dump')}>
          <Text style={styles.badge}>DUMPWATCH SA</Text>
          <Text style={styles.cardTitle}>Illegal dumping</Text>
          <Text style={styles.earn}>Earn up to R300 per post</Text>
          <Text style={styles.copy}>
            5-second video, then car, person and plate photos. Title and street details come last.
          </Text>
          <View style={styles.btn}>
            <Text style={styles.btnText}>Post dumping</Text>
          </View>
        </Pressable>
        </View>

        <View style={styles.waterSection}>
          <GreenHero
            variant="water"
            kicker="WaterWatch SA"
            title="Water and sewers"
            subtitle="Leaks, dry taps and sewer overflows. One video and one picture. No number plate."
          />

        <Pressable style={styles.waterCard} onPress={() => router.push('/water')}>
          <Text style={styles.badge}>WATERWATCH SA</Text>
          <Text style={styles.cardTitle}>Water or sewer</Text>
          <Text style={styles.earn}>Earn up to R20 per post</Text>
          <Text style={styles.copy}>
            One 5-second video and one picture of a leak, dry tap or sewer overflow. Then title, description and street.
          </Text>
          <View style={[styles.btn, styles.waterBtn]}>
            <Text style={styles.btnText}>Post water or sewer</Text>
          </View>
        </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40, paddingTop: 8 },
  dumpSection: { paddingHorizontal: 16, paddingBottom: 8, gap: 14 },
  waterSection: {
    marginTop: 12,
    backgroundColor: colors.waterBand,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 14,
  },
  dumpCard: {
    backgroundColor: colors.forest,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.leaf,
  },
  waterCard: {
    backgroundColor: colors.water,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.waterBorder,
  },
  badge: {
    color: colors.kicker,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.cream,
    fontSize: 24,
    fontWeight: '800',
  },
  earn: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  copy: {
    color: colors.heroCopy,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  btn: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterBtn: {
    backgroundColor: colors.waterDeep,
  },
  btnText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '900',
  },
});
