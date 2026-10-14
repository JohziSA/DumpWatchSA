import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GreenHero } from '@/components/dumpwatch/GreenHero';
import { ReportFeed } from '@/components/dumpwatch/ReportFeed';
import { useReports } from '@/context/ReportsProvider';
import { useThemedStyles } from '@/context/ThemeProvider';
import { splitByKind } from '@/lib/mediaSlots';
import type { ThemeColors } from '@/lib/theme';

export default function ProvinceFeedScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { name } = useLocalSearchParams<{ name: string }>();
  const province = Array.isArray(name) ? name[0] : name;
  const { reportsForProvince, ready, setReportEmojis } = useReports();
  const reports = province ? reportsForProvince(province) : [];
  const { dumping, water } = splitByKind(reports);
  const openReport = (id: string) => router.push({ pathname: '/report/[id]', params: { id } });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dumpSection}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <GreenHero
            kicker="DumpWatch SA"
            title={province ?? 'Province'}
            subtitle="Illegal dumping in this province, newest first."
          />
          <ReportFeed
            title="DumpWatch reports"
            empty="No dumping reports in this province yet."
            reports={dumping}
            ready={ready}
            onOpen={openReport}
            onChangeEmojis={setReportEmojis}
          />
        </View>

        <View style={styles.waterSection}>
          <GreenHero
            variant="water"
            kicker="WaterWatch SA"
            title={province ?? 'Province'}
            subtitle="Water and sewer reports in this province, newest first."
          />
          <ReportFeed
            title="WaterWatch reports"
            empty="No water or sewer reports in this province yet."
            reports={water}
            tone="water"
            ready={ready}
            onOpen={openReport}
            onChangeEmojis={setReportEmojis}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32, paddingTop: 8 },
  dumpSection: { paddingHorizontal: 16, paddingBottom: 8 },
  waterSection: {
    marginTop: 8,
    backgroundColor: colors.waterBand,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  backBtn: { minHeight: 44, justifyContent: 'center' },
  back: { color: colors.heading, fontWeight: '800', fontSize: 16 },
});
