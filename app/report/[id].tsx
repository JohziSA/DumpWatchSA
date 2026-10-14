import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioPlayer } from '@/components/dumpwatch/AudioPlayer';
import { ClipPlayer } from '@/components/dumpwatch/ClipPlayer';
import { EmojiBar } from '@/components/dumpwatch/EmojiBar';
import { MediaViewer } from '@/components/dumpwatch/MediaViewer';
import { TagPill } from '@/components/dumpwatch/TagPill';
import { useReports } from '@/context/ReportsProvider';
import { addEmoji, pressEmoji } from '@/lib/emojis';
import { kindLabel, labeledMedia } from '@/lib/mediaSlots';
import { waterIssueLabel } from '@/lib/types';
import { mediaSource } from '@/lib/media';
import { formatOccurred, prosecutionLabel, statusLabel } from '@/lib/provinces';
import { plateStatusCopy, plateStatusFromConfidence } from '@/lib/verifyNumberPlate';
import { useAppTheme, useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { getReport, ready, setReportEmojis } = useReports();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const report = id ? getReport(Array.isArray(id) ? id[0] : id) : undefined;

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Report not found</Text>
      </SafeAreaView>
    );
  }

  const { date, time } = formatOccurred(report.occurredAt);
  const isWater = report.kind === 'water';
  const accepted = report.plateDetections.find((d) => d.accepted) ?? report.plateDetections[0];
  const confidence = accepted?.confidence ?? report.plateConfidence;
  const status = plateStatusFromConfidence(confidence);

  let aiCopy = 'Not detected.';
  if (report.plateSource === 'user') {
    aiCopy = 'Manual entry';
  } else if (accepted) {
    const from = ` from photo ${accepted.photoIndex + 1}`;
    if (status === 'verified') {
      aiCopy = `Verified ${Math.round(accepted.confidence)}%${from}`;
    } else if (status === 'possible') {
      aiCopy = `Possible ${Math.round(accepted.confidence)}%${from}`;
    }
  } else if (report.plateSource === 'ai_confirmed_by_user' && confidence) {
    aiCopy = `Verified ${Math.round(confidence)}%`;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={[styles.title, isWater && styles.waterTitle]}>{report.title}</Text>
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
            tone={
              report.status === 'deletion_requested' || report.status === 'pending_approval'
                ? 'clay'
                : 'sage'
            }
          />
          {!isWater && report.plateVerified ? <TagPill label="Plate verified" /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prosecution status</Text>
          <Text style={styles.body}>{prosecutionLabel(report.prosecutionStatus)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Emojis</Text>
          <EmojiBar
            emojis={report.emojis ?? []}
            onPressEmoji={(emoji) => setReportEmojis(report.id, pressEmoji(report.emojis, emoji))}
            onAddEmoji={(emoji) => setReportEmojis(report.id, addEmoji(report.emojis, emoji))}
          />
        </View>

        {labeledMedia(report).map((item, index) => (
          <Pressable key={item.slot} style={styles.card} onPress={() => setViewerIndex(index)}>
            <Text style={styles.label}>{item.label}</Text>
            {item.uri && item.type === 'video' ? (
              <ClipPlayer uri={item.uri} style={styles.slotMedia} />
            ) : item.uri ? (
              <Image source={mediaSource(item.uri)} style={styles.slotMedia} resizeMode="cover" />
            ) : (
              <View style={styles.slotEmpty}>
                <Text style={styles.body}>Not captured</Text>
              </View>
            )}
            <Text style={styles.openHint}>Tap to open full screen and switch between evidence</Text>
          </Pressable>
        ))}

        <MediaViewer
          items={labeledMedia(report)}
          startIndex={viewerIndex ?? 0}
          visible={viewerIndex != null}
          onClose={() => setViewerIndex(null)}
        />

        <View style={styles.card}>
          <Text style={styles.label}>Date and time</Text>
          <Text style={styles.body}>
            {date} · {time}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Province and location</Text>
          <Text style={styles.body}>{report.province}</Text>
          <Text style={[styles.body, { marginTop: 6 }]}>{report.locationText || 'Not specified'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Coordinates</Text>
          <Text style={styles.coords}>
            {report.lat != null && report.lng != null
              ? `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`
              : 'No GPS coordinates'}
          </Text>
        </View>

        {!isWater ? (
          <>
            <View style={styles.plateBox}>
              <Text style={styles.label}>Number plate</Text>
              <Text style={styles.plate}>{report.numberPlate || 'No plate recorded'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>AI verification</Text>
              <Text
                style={[
                  styles.body,
                  status === 'verified' && { color: colors.primary },
                  status === 'possible' && { color: colors.accent },
                ]}>
                {report.plateSource === 'user' ? 'Manual entry' : plateStatusCopy(confidence)}
              </Text>
              <Text style={[styles.body, { marginTop: 6 }]}>{aiCopy}</Text>
            </View>
          </>
        ) : null}

        {report.description ? (
          <View style={styles.card}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.body}>{report.description}</Text>
          </View>
        ) : null}

        {report.audioUri ? (
          <View style={styles.card}>
            <Text style={styles.label}>Voice note</Text>
            <AudioPlayer uri={report.audioUri} />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Reporter</Text>
          <Text style={styles.body}>{report.authorName}</Text>
          <Text style={[styles.label, { marginTop: 12 }]}>Status</Text>
          <Text style={styles.body}>{statusLabel(report.status)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, gap: 14 },
  backBtn: { minHeight: 44, justifyContent: 'center' },
  back: { color: colors.heading, fontWeight: '800', fontSize: 16 },
  title: { color: colors.heading, fontSize: 26, fontWeight: '800', lineHeight: 32 },
  waterTitle: { color: colors.headingWater },
  pills: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    boxShadow: colors.shadowDump,
  },
  plateBox: {
    backgroundColor: colors.mint,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  body: { color: colors.text, fontSize: 16, lineHeight: 23 },
  plate: {
    color: colors.heading,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  coords: {
    color: colors.text,
    fontFamily: 'SpaceMono',
    fontSize: 14,
  },
  muted: { color: colors.muted, padding: 16 },
  slotMedia: { width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.videoBg },
  slotEmpty: {
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openHint: { color: colors.muted, fontSize: 12, marginTop: 8, fontWeight: '600' },
});
