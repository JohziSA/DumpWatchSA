import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GreenHero } from '@/components/dumpwatch/GreenHero';
import { ReportFeed } from '@/components/dumpwatch/ReportFeed';
import { useReports } from '@/context/ReportsProvider';
import { useThemedStyles } from '@/context/ThemeProvider';
import { HOME_FEED_LIMIT, splitByKind } from '@/lib/mediaSlots';
import type { ThemeColors } from '@/lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { ready, reports, setReportEmojis } = useReports();
  const { dumping, water } = splitByKind(reports);

  const openReport = (id: string) => router.push({ pathname: '/report/[id]', params: { id } });
  const openDumpWatch = () => router.push({ pathname: '/watch/[kind]', params: { kind: 'dumping' } });
  const openWaterWatch = () => router.push({ pathname: '/watch/[kind]', params: { kind: 'water' } });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GreenHero
          kicker="South Africa"
          title="Watch SA"
          subtitle="Choose DumpWatch or WaterWatch. Spot it. Snap it. Help keep streets, taps and sewers working."
          showDarkSwitch
        />

        <Text style={styles.section}>Choose a watch</Text>
        <View style={styles.picks}>
          <Pressable style={styles.pick} onPress={openDumpWatch}>
            <Text style={styles.pickBadge}>DUMPWATCH SA</Text>
            <Text style={styles.pickTitle}>Illegal dumping</Text>
            <Text style={styles.pickCopy}>Browse all dumping posts</Text>
            <Text style={styles.pickCta}>Open DumpWatch</Text>
          </Pressable>
          <Pressable style={[styles.pick, styles.pickWater]} onPress={openWaterWatch}>
            <Text style={[styles.pickBadge, styles.pickBadgeWater]}>WATERWATCH SA</Text>
            <Text style={styles.pickTitle}>Water and sewers</Text>
            <Text style={styles.pickCopy}>Leaks, dry taps and sewer overflows</Text>
            <Text style={[styles.pickCta, styles.pickCtaWater]}>Open WaterWatch</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Quick post</Text>
        <Pressable style={styles.quickPost} onPress={() => router.push('/dump')}>
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeText}>DUMPWATCH SA</Text>
          </View>
          <Text style={styles.quickTitle}>See dumping? Post it now.</Text>
          <Text style={styles.quickEarn}>Earn up to R300 per post</Text>
          <Text style={styles.quickCopy}>
            Camera opens first. 5-second video, then car, person and plate photos.
          </Text>
          <View style={styles.quickBtn}>
            <Text style={styles.quickBtnText}>Post dumping</Text>
          </View>
        </Pressable>

        <Pressable style={[styles.quickPost, styles.quickWater]} onPress={() => router.push('/water')}>
          <View style={[styles.quickBadge, styles.quickBadgeWater]}>
            <Text style={styles.quickBadgeText}>WATERWATCH SA</Text>
          </View>
          <Text style={styles.quickTitle}>Sewer or water issue? Post it now.</Text>
          <Text style={styles.quickEarn}>Earn up to R20 per post</Text>
          <Text style={styles.quickCopy}>
            One 5-second video and one picture of a leak, dry tap or sewer. Then title, description and street. No number plate.
          </Text>
          <View style={[styles.quickBtn, styles.quickBtnWater]}>
            <Text style={styles.quickBtnText}>Post water or sewer</Text>
          </View>
        </Pressable>

        <ReportFeed
          title="Latest DumpWatch"
          empty="No dumping reports yet."
          reports={dumping.slice(0, HOME_FEED_LIMIT)}
          ready={ready}
          onOpen={openReport}
          onChangeEmojis={setReportEmojis}
          onSeeMore={openDumpWatch}
        />

        <View style={styles.waterFeed}>
          <ReportFeed
            title="Latest water and sewers"
            empty="No water or sewer reports yet."
            reports={water.slice(0, HOME_FEED_LIMIT)}
            tone="water"
            ready={ready}
            onOpen={openReport}
            onChangeEmojis={setReportEmojis}
            onSeeMore={openWaterWatch}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  section: {
    color: colors.heading,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 4,
  },
  picks: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  pick: {
    flex: 1,
    backgroundColor: colors.forest,
    borderRadius: 18,
    padding: 14,
    minHeight: 148,
    borderWidth: 2,
    borderColor: colors.leaf,
    justifyContent: 'space-between',
  },
  pickWater: {
    backgroundColor: colors.water,
    borderColor: colors.waterBorder,
  },
  pickBadge: {
    color: colors.kicker,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pickBadgeWater: {
    color: colors.kicker,
  },
  pickTitle: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  pickCopy: {
    color: colors.heroCopy,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  pickCta: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  pickCtaWater: {
    color: colors.gold,
  },
  quickPost: {
    backgroundColor: colors.forest,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.leaf,
    boxShadow: colors.shadowDump,
  },
  quickWater: {
    backgroundColor: colors.water,
    borderColor: colors.waterBorder,
    boxShadow: colors.shadowWater,
    marginBottom: 18,
  },
  quickBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.leaf,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  quickBadgeWater: {
    backgroundColor: colors.waterDeep,
  },
  quickBadgeText: {
    color: colors.cream,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  quickTitle: {
    color: colors.cream,
    fontSize: 20,
    fontWeight: '800',
  },
  quickEarn: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  quickCopy: {
    color: colors.heroCopy,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  quickBtn: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    color: colors.cream,
    fontSize: 17,
    fontWeight: '900',
  },
  quickBtnWater: {
    backgroundColor: colors.waterDeep,
  },
  waterFeed: {
    backgroundColor: colors.waterBand,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    marginTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
});
