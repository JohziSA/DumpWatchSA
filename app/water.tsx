import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClipPlayer } from '@/components/dumpwatch/ClipPlayer';
import { GreenHero } from '@/components/dumpwatch/GreenHero';
import { useReports } from '@/context/ReportsProvider';
import { inferProvinceFromCoords } from '@/lib/provinces';
import { useAppTheme, useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';
import {
  EMOJI_LIMIT,
  EMOJI_PALETTE,
  SA_PROVINCES,
  WATER_ISSUE_OPTIONS,
  type SaProvince,
  type WaterIssue,
} from '@/lib/types';

type Step = 'video' | 'photo' | 'review' | 'details';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function nowParts(d = new Date()) {
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

async function capturePhoto(): Promise<string | undefined> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return undefined;
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.45,
  });
  if (result.canceled) return undefined;
  return result.assets[0]?.uri;
}

async function captureVideo(): Promise<string | undefined> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return undefined;
  await ImagePicker.requestMediaLibraryPermissionsAsync();
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['videos'],
    videoMaxDuration: 5,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    quality: 0.4,
  });
  if (result.canceled) return undefined;
  return result.assets[0]?.uri;
}

export default function WaterReportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { ready, addReport } = useReports();
  const autoStarted = useRef(false);
  const [step, setStep] = useState<Step>('video');
  const [videoUri, setVideoUri] = useState<string | undefined>();
  const [photoScene, setPhotoScene] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [locating, setLocating] = useState(false);
  const initial = nowParts();
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [province, setProvince] = useState<SaProvince | ''>('');
  const [waterIssue, setWaterIssue] = useState<WaterIssue | ''>('');
  const [pickedEmojis, setPickedEmojis] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startVideo = useCallback(async () => {
    setError(null);
    const uri = await captureVideo();
    if (uri) {
      setVideoUri(uri);
      setStep('photo');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (autoStarted.current || step !== 'video' || videoUri) return;
      autoStarted.current = true;
      const timer = setTimeout(() => {
        void startVideo();
      }, 250);
      return () => clearTimeout(timer);
    }, [startVideo, step, videoUri]),
  );

  const takePhoto = async () => {
    setError(null);
    const uri = await capturePhoto();
    if (!uri) return;
    setPhotoScene(uri);
    setStep('review');
  };

  const useLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setError('Location permission is needed to pin this water or sewer issue.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
      const inferred = inferProvinceFromCoords(pos.coords.latitude, pos.coords.longitude);
      if (inferred) setProvince(inferred);
      if (!locationText) {
        setLocationText(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      }
    } catch {
      setError('Could not read your current location.');
    } finally {
      setLocating(false);
    }
  };

  const resetWizard = () => {
    autoStarted.current = false;
    setStep('video');
    setVideoUri(undefined);
    setPhotoScene(undefined);
    setTitle('');
    setDescription('');
    setLocationText('');
    setLat(undefined);
    setLng(undefined);
    setPickedEmojis([]);
    setProvince('');
    setWaterIssue('');
    const parts = nowParts();
    setDate(parts.date);
    setTime(parts.time);
  };

  const submit = async () => {
    setError(null);
    if (!videoUri && !photoScene) {
      setError('Add a 5-second video or one picture.');
      return;
    }
    if (!title.trim()) {
      setError('Please add a title.');
      return;
    }
    if (!province) {
      setError('Please choose a province.');
      return;
    }
    if (!waterIssue) {
      setError('Please choose the issue type — sewer, leak, no water or flooding.');
      return;
    }
    const occurred = new Date(`${date}T${time}:00`);
    if (Number.isNaN(occurred.getTime())) {
      setError('Please enter a valid date and time.');
      return;
    }

    setSubmitting(true);
    try {
      await addReport({
        kind: 'water',
        waterIssue,
        title: title.trim(),
        description: description.trim(),
        photos: photoScene ? [photoScene] : [],
        videoUri,
        photoScene,
        plateVerified: false,
        plateDetections: [],
        locationText: locationText.trim() || undefined,
        lat,
        lng,
        province,
        occurredAt: occurred.toISOString(),
        status: 'pending_approval',
        prosecutionStatus: 'not_started',
        emojis: pickedEmojis.map((emoji) => ({ emoji, count: 1, mine: true })),
      });
      resetWizard();
      router.replace('/');
    } catch {
      setError('Could not save this report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'video' || step === 'photo') {
    const isVideo = step === 'video';
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <GreenHero
            variant="water"
            kicker={isVideo ? 'Step 1 of 2' : 'Step 2 of 2'}
            title={isVideo ? '5-second scene video' : 'One water picture'}
            subtitle={
              isVideo
                ? 'Record the leak, sewer overflow, flood or dry tap. Maximum 5 seconds. Skip if you only have time for a photo.'
                : 'Take one picture of the water or sewer issue. Crop it before saving.'
            }
          />
          {isVideo && videoUri ? <ClipPlayer uri={videoUri} style={styles.preview} /> : null}
          {!isVideo && photoScene ? (
            <Image source={{ uri: photoScene }} style={styles.preview} resizeMode="cover" />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={() => (isVideo ? void startVideo() : void takePhoto())}>
            <Text style={styles.primaryText}>
              {isVideo ? (videoUri ? 'Retake video' : 'Record now') : photoScene ? 'Retake picture' : 'Take picture'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            onPress={() => setStep(isVideo ? 'photo' : 'review')}>
            <Text style={styles.secondaryText}>
              {(isVideo ? videoUri : photoScene) ? 'Use this and continue' : 'Skip'}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'review') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <GreenHero
            variant="water"
            kicker="Review evidence"
            title="Check video and picture"
            subtitle="A blank slot is fine if you only had time for one. WaterWatch must approve the post."
          />
          <View style={styles.card}>
            <Text style={styles.label}>Scene video (5s)</Text>
            {videoUri ? (
              <ClipPlayer uri={videoUri} style={styles.slotMedia} />
            ) : (
              <View style={styles.slotEmpty}>
                <Text style={styles.help}>Not captured</Text>
              </View>
            )}
            <Pressable style={styles.tiny} onPress={() => setStep('video')}>
              <Text style={styles.tinyText}>{videoUri ? 'Retake' : 'Capture'}</Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Water picture</Text>
            {photoScene ? (
              <Image source={{ uri: photoScene }} style={styles.slotMedia} resizeMode="cover" />
            ) : (
              <View style={styles.slotEmpty}>
                <Text style={styles.help}>Not captured</Text>
              </View>
            )}
            <Pressable style={styles.tiny} onPress={() => setStep('photo')}>
              <Text style={styles.tinyText}>{photoScene ? 'Retake' : 'Capture'}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.primary} onPress={() => setStep('details')}>
            <Text style={styles.primaryText}>Continue to details</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GreenHero
          variant="water"
          kicker="Last step"
          title="Finish the WaterWatch report"
          subtitle="Evidence is attached. Add street / location, then title last."
        />

        <Field label="Location / street">
          <Action label={locating ? 'Finding you…' : 'Use my current location'} onPress={useLocation} />
          <TextInput
            value={locationText}
            onChangeText={setLocationText}
            placeholder="Street, landmark or settlement"
            placeholderTextColor={colors.muted}
            style={[styles.input, { marginTop: 10 }]}
          />
        </Field>

        <Field label="Issue type">
          <View style={styles.wrap}>
            {WATER_ISSUE_OPTIONS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setWaterIssue(item.id)}
                style={[styles.chip, waterIssue === item.id && styles.chipOn]}>
                <Text style={[styles.chipText, waterIssue === item.id && styles.chipOnText]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Province">
          <View style={styles.wrap}>
            {SA_PROVINCES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setProvince(item)}
                style={[styles.chip, province === item && styles.chipOn]}>
                <Text style={[styles.chipText, province === item && styles.chipOnText]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Date and time">
          <View style={styles.row}>
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={[styles.input, styles.flex]} />
            <TextInput value={time} onChangeText={setTime} placeholder="HH:MM" style={[styles.input, styles.flex]} />
          </View>
        </Field>

        <Field label={`Emojis (${pickedEmojis.length}/${EMOJI_LIMIT})`}>
          <View style={styles.wrap}>
            {EMOJI_PALETTE.map((emoji) => {
              const selected = pickedEmojis.includes(emoji);
              const full = !selected && pickedEmojis.length >= EMOJI_LIMIT;
              return (
                <Pressable
                  key={emoji}
                  disabled={full}
                  onPress={() =>
                    setPickedEmojis((current) =>
                      current.includes(emoji)
                        ? current.filter((item) => item !== emoji)
                        : current.length >= EMOJI_LIMIT
                          ? current
                          : [...current, emoji],
                    )
                  }
                  style={[styles.emojiPick, selected && styles.emojiPickOn, full && styles.emojiPickOff]}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Description">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Leak, blocked sewer, sewage overflow, no water, flooding…"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.multiline]}
            multiline
          />
        </Field>

        <Field label="Title">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Short title for this water or sewer issue"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primary, (!ready || submitting) && styles.disabled]}
          disabled={!ready || submitting}
          onPress={submit}>
          <Text style={styles.primaryText}>{submitting ? 'Saving…' : 'Submit for approval'}</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => setStep('review')}>
          <Text style={styles.secondaryText}>Back to evidence</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, gap: 12 },
  preview: { width: '100%', height: 240, borderRadius: 18, backgroundColor: colors.videoBgWater },
  primary: {
    backgroundColor: colors.water,
    borderRadius: radii.input,
    paddingVertical: 16,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: colors.cream, fontSize: 17, fontWeight: '800' },
  secondary: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  secondaryText: { color: colors.headingWater, fontWeight: '800', fontSize: 15 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  slotMedia: { width: '100%', height: 180, borderRadius: 12, marginTop: 8, backgroundColor: colors.videoBgWater },
  slotEmpty: {
    height: 80,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.waterMint,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  flex: { flex: 1, minWidth: 120 },
  action: {
    backgroundColor: colors.water,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionText: { color: colors.cream, fontWeight: '700', fontSize: 13 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.waterMintBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: colors.waterMint,
  },
  chipOn: { backgroundColor: colors.water, borderColor: colors.water },
  chipText: { color: colors.headingWater, fontSize: 12, fontWeight: '700' },
  chipOnText: { color: colors.cream },
  emojiPick: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.waterMint,
    borderWidth: 1.5,
    borderColor: colors.waterMintBorder,
  },
  emojiPickOn: { backgroundColor: colors.water, borderColor: colors.water },
  emojiPickOff: { opacity: 0.35 },
  emojiText: { fontSize: 22 },
  tiny: { alignSelf: 'flex-start', marginTop: 8, minHeight: 36, justifyContent: 'center' },
  tinyText: { color: colors.headingWater, fontWeight: '800' },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.accent, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
