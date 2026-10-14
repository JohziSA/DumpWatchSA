import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';
import type { Report } from '@/lib/types';

import { ReportCard } from './ReportCard';

export function ReportFeed({
  title,
  empty,
  reports,
  tone = 'dump',
  ready = true,
  onOpen,
  onChangeEmojis,
  footer,
  onSeeMore,
}: {
  title: string;
  empty: string;
  reports: Report[];
  tone?: 'dump' | 'water';
  ready?: boolean;
  onOpen: (id: string) => void;
  onChangeEmojis: (id: string, emojis: Report['emojis']) => void;
  footer?: (report: Report) => ReactNode;
  onSeeMore?: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, tone === 'water' && styles.waterTitle]}>{title}</Text>
        {onSeeMore ? (
          <Pressable
            onPress={onSeeMore}
            style={[styles.seeMore, tone === 'water' && styles.seeMoreWater]}
            accessibilityRole="button"
            accessibilityLabel={`${title}, see more`}>
            <Text style={[styles.seeMoreText, tone === 'water' && styles.seeMoreTextWater]}>See more</Text>
          </Pressable>
        ) : null}
      </View>
      {!ready ? (
        <Text style={styles.empty}>Loading reports…</Text>
      ) : reports.length === 0 ? (
        <View style={[styles.emptyCard, tone === 'water' && styles.emptyWater]}>
          <Text style={styles.empty}>{empty}</Text>
        </View>
      ) : (
        reports.map((report) => (
          <View key={report.id}>
            <ReportCard
              report={report}
              onPress={() => onOpen(report.id)}
              onChangeEmojis={(emojis) => onChangeEmojis(report.id, emojis)}
            />
            {footer ? footer(report) : null}
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  waterTitle: {
    color: colors.headingWater,
  },
  seeMore: {
    backgroundColor: colors.mint,
    borderRadius: 999,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.mintBorder,
  },
  seeMoreWater: {
    backgroundColor: colors.waterMint,
    borderColor: colors.waterMintBorder,
  },
  seeMoreText: {
    color: colors.heading,
    fontWeight: '800',
    fontSize: 13,
  },
  seeMoreTextWater: {
    color: colors.headingWater,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 8,
  },
  emptyWater: {
    backgroundColor: colors.waterMint,
    borderColor: colors.waterMintBorder,
  },
  empty: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
