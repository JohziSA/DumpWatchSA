import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { addEmoji, pressEmoji } from '@/lib/emojis';
import { coverUri, kindLabel } from '@/lib/mediaSlots';
import { mediaSource } from '@/lib/media';
import { formatOccurred, prosecutionLabel, statusLabel } from '@/lib/provinces';
import { waterIssueLabel } from '@/lib/types';
import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';
import type { Report } from '@/lib/types';

import { EmojiBar } from './EmojiBar';
import { TagPill } from './TagPill';

export function ReportCard({
  report,
  onPress,
  onChangeEmojis,
}: {
  report: Report;
  onPress: () => void;
  onChangeEmojis: (emojis: Report['emojis']) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const emojis = Array.isArray(report.emojis) ? report.emojis : [];
  const source = mediaSource(coverUri(report));
  const { date, time } = formatOccurred(report.occurredAt);
  const isWater = report.kind === 'water';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        {source ? (
          <Image source={source} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={[styles.stripe, isWater && styles.stripeWater]} />
        <View style={[styles.photoFade, isWater && styles.photoFadeWater]} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {report.title}
        </Text>
        <View style={styles.pills}>
          <TagPill label={kindLabel(report.kind)} tone={isWater ? 'water' : 'sage'} />
          {isWater && waterIssueLabel(report.waterIssue) ? (
            <TagPill label={waterIssueLabel(report.waterIssue)!} tone="water" />
          ) : null}
          <TagPill label={date.toUpperCase()} />
          <TagPill label={time} />
          <TagPill label={report.province.toUpperCase()} />
          <TagPill
            label={statusLabel(report.status)}
            tone={report.status === 'pending_approval' || report.status === 'deletion_requested' ? 'clay' : 'sage'}
          />
          {!isWater && report.plateVerified ? <TagPill label="Plate verified" /> : null}
        </View>
        <View style={styles.prosecution}>
          <Text style={styles.prosecutionText}>{prosecutionLabel(report.prosecutionStatus)}</Text>
        </View>
        <View
          onStartShouldSetResponder={() => true}
          onTouchEnd={(event) => event.stopPropagation()}>
          <EmojiBar
            emojis={emojis}
            onPressEmoji={(emoji) => onChangeEmojis(pressEmoji(emojis, emoji))}
            onAddEmoji={(emoji) => onChangeEmojis(addEmoji(emojis, emoji))}
          />
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    boxShadow: colors.shadowDump,
  },
  pressed: {
    opacity: 0.98,
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.leaf,
  },
  stripeWater: {
    backgroundColor: colors.water,
  },
  photoFadeWater: {
    backgroundColor: colors.photoFadeWater,
  },
  imageWrap: {
    height: 280,
    width: '100%',
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: colors.photoFade,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.placeholder,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.card,
  },
  title: {
    color: colors.heading,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 10,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  prosecution: {
    backgroundColor: colors.mint,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    marginTop: 2,
  },
  prosecutionText: {
    color: colors.heading,
    fontWeight: '800',
    fontSize: 13,
  },
});
