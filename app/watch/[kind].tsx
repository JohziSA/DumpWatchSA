import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GreenHero } from '@/components/dumpwatch/GreenHero';
import { ProvinceChips } from '@/components/dumpwatch/ProvinceChips';
import { ReportFeed } from '@/components/dumpwatch/ReportFeed';
import { useReports } from '@/context/ReportsProvider';
import { useThemedStyles } from '@/context/ThemeProvider';
import { splitByKind } from '@/lib/mediaSlots';
import { radii, type ThemeColors } from '@/lib/theme';

export default function WatchListingScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { kind: kindParam } = useLocalSearchParams<{ kind: string }>();
  const isWater = (Array.isArray(kindParam) ? kindParam[0] : kindParam) === 'water';
  const { ready, reports, setReportEmojis } = useReports();
  const [province, setProvince] = useState<'all' | string>('all');
  const { dumping, water } = splitByKind(reports);

  const allForKind = isWater ? water : dumping;
  const filtered = useMemo(
    () => (province === 'all' ? allForKind : allForKind.filter((report) => report.province === province)),
    [allForKind, province],
  );

  const openReport = (id: string) => router.push({ pathname: '/report/[id]', params: { id } });

  return (
    <SafeAreaView style={[styles.safe, isWater && styles.safeWater]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={[styles.back, isWater && styles.backWater]}>Back</Text>
        </Pressable>

        <GreenHero
          variant={isWater ? 'water' : 'dump'}
          kicker={isWater ? 'WaterWatch SA' : 'DumpWatch SA'}
          title={isWater ? 'Water and sewers' : 'Illegal dumping'}
          subtitle={
            isWater
              ? 'Leaks, dry taps and sewer overflows, newest first. Filter by province.'
              : 'All DumpWatch posts, newest first. Filter by province.'
          }
        />

        <Pressable
          style={[styles.quick, isWater && styles.quickWater]}
          onPress={() => router.push(isWater ? '/water' : '/dump')}>
          <Text style={styles.quickTitle}>{isWater ? 'Quick post water or sewer' : 'Quick post dumping'}</Text>
          <Text style={styles.quickEarn}>{isWater ? 'Earn up to R20 per post' : 'Earn up to R300 per post'}</Text>
        </Pressable>

        <View style={[styles.panel, isWater && styles.panelWater]}>
          <Text style={[styles.section, isWater && styles.sectionWater]}>Choose a province</Text>
          <ProvinceChips
            selected={province}
            tone={isWater ? 'water' : 'dump'}
            onSelectAll={() => setProvince('all')}
            onSelectProvince={setProvince}
          />
        </View>

        <ReportFeed
          title={
            province === 'all'
              ? isWater
                ? 'All water and sewer posts'
                : 'All DumpWatch posts'
              : isWater
                ? `WaterWatch · ${province}`
                : `DumpWatch · ${province}`
          }
          empty={
            isWater
              ? 'No water or sewer reports in this selection yet.'
              : 'No dumping reports in this selection yet.'
          }
          reports={filtered}
          tone={isWater ? 'water' : 'dump'}
          ready={ready}
          onOpen={openReport}
          onChangeEmojis={setReportEmojis}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  safeWater: { backgroundColor: colors.waterBand },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  backBtn: { minHeight: 44, justifyContent: 'center' },
  back: { color: colors.heading, fontWeight: '800', fontSize: 16 },
  backWater: { color: colors.headingWater },
  quick: {
    backgroundColor: colors.forest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: colors.leaf,
  },
  quickWater: {
    backgroundColor: colors.water,
    borderColor: colors.waterBorder,
  },
  quickTitle: { color: colors.cream, fontSize: 17, fontWeight: '800' },
  quickEarn: { color: colors.gold, fontSize: 15, fontWeight: '800', marginTop: 4 },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 8,
  },
  panelWater: {
    backgroundColor: colors.waterMint,
    borderColor: colors.waterMintBorder,
  },
  section: {
    color: colors.heading,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  sectionWater: { color: colors.headingWater },
});
