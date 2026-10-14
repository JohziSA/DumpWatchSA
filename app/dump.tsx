import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
import { labeledMedia } from '@/lib/mediaSlots';
import { inferProvinceFromCoords } from '@/lib/provinces';
import { useAppTheme, useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';
import {
  EMOJI_LIMIT,
  EMOJI_PALETTE,
  SA_PROVINCES,
  type MediaSlot,
  type PlateDetection,
  type PlateSource,
  type SaProvince,
} from '@/lib/types';
import {
  normalizePlate,
  plateStatusCopy,
  verifyNumberPlateFromImages,
  type PlateScanHit,
} from '@/lib/verifyNumberPlate';

type Step = 'video' | 'car' | 'person' | 'plate' | 'review' | 'details';
type DumpSlot = Extract<MediaSlot, 'video' | 'car' | 'person' | 'plate'>;
type DumpPhotoSlot = Exclude<DumpSlot, 'video'>;

const NEXT: Record<Step, Step> = {
  video: 'car',
  car: 'person',
  person: 'plate',
  plate: 'review',
  review: 'details',
  details: 'details',
};

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

export default function NewReportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { ready, addReport } = useReports();
  const autoStarted = useRef(false);
  const [step, setStep] = useState<Step>('video');
  const [videoUri, setVideoUri] = useState<string | undefined>();
  const [photoCar, setPhotoCar] = useState<string | undefined>();
  const [photoPerson, setPhotoPerson] = useState<string | undefined>();
  const [photoPlate, setPhotoPlate] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scanning, setScanning] = useState(false);
  const [hits, setHits] = useState<PlateScanHit[]>([]);
  const [plate, setPlate] = useState('');
  const [plateSource, setPlateSource] = useState<PlateSource | null>(null);
  const [plateConfidence, setPlateConfidence] = useState<number | undefined>();
  const [plateVerified, setPlateVerified] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [locating, setLocating] = useState(false);
  const initial = nowParts();
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [province, setProvince] = useState<SaProvince | ''>('');
  const [pickedEmojis, setPickedEmojis] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const top = hits[0];

  useEffect(() => {
    if (!photoPlate) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setScanning(true);
    verifyNumberPlateFromImages([{ uri: photoPlate }]).then((result) => {
      if (cancelled) return;
      setHits(result);
      setScanning(false);
      if (result[0] && !plate) setPlate(result[0].rawText);
    });
    return () => {
      cancelled = true;
    };
  }, [photoPlate]);

  const startVideo = useCallback(async () => {
    setError(null);
    const uri = await captureVideo();
    if (uri) {
      setVideoUri(uri);
      setStep('car');
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

  const setSlot = (slot: DumpSlot, uri: string | undefined) => {
    if (slot === 'video') setVideoUri(uri);
    if (slot === 'car') setPhotoCar(uri);
    if (slot === 'person') setPhotoPerson(uri);
    if (slot === 'plate') setPhotoPlate(uri);
  };

  const captureSlot = async (slot: DumpPhotoSlot) => {
    setError(null);
    const uri = await capturePhoto();
    if (!uri) return;
    setSlot(slot, uri);
    setStep(NEXT[slot]);
  };

  const useLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setError('Location permission is needed to pin this dump site.');
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
    setPhotoCar(undefined);
    setPhotoPerson(undefined);
    setPhotoPlate(undefined);
    setTitle('');
    setDescription('');
    setHits([]);
    setPlate('');
    setPlateSource(null);
    setLocationText('');
    setLat(undefined);
    setLng(undefined);
    setPickedEmojis([]);
    setProvince('');
    const parts = nowParts();
    setDate(parts.date);
    setTime(parts.time);
  };

  const submit = async () => {
    setError(null);
    if (!videoUri && !photoCar && !photoPerson && !photoPlate) {
      setError('Add a 5-second video or at least one picture.');
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
    const occurred = new Date(`${date}T${time}:00`);
    if (Number.isNaN(occurred.getTime())) {
      setError('Please enter a valid date and time.');
      return;
    }

    const trimmedPlate = plate.trim();
    let source = plateSource;
    let confidence = plateConfidence;
    let verified = plateVerified;
    if (trimmedPlate && !source) {
      source = 'user';
      confidence = undefined;
      verified = false;
    }

    const detections: PlateDetection[] = hits.map((hit, index) => ({
      rawText: hit.rawText,
      normalized: hit.normalized,
      confidence: hit.confidence,
      photoIndex: hit.photoIndex,
      accepted:
        Boolean(trimmedPlate && normalizePlate(hit.rawText) === normalizePlate(trimmedPlate)) ||
        (index === 0 && source === 'ai_confirmed_by_user'),
      boundingBox: hit.boundingBox,
    }));

    setSubmitting(true);
    try {
      await addReport({
        kind: 'dumping',
        title: title.trim(),
        description: description.trim(),
        photos: [photoCar, photoPerson, photoPlate].filter(Boolean) as string[],
        videoUri,
        photoCar,
        photoPerson,
        photoPlate,
        numberPlate: trimmedPlate || undefined,
        plateNormalized: trimmedPlate ? normalizePlate(trimmedPlate) : undefined,
        plateConfidence: trimmedPlate ? confidence : undefined,
        plateSource: trimmedPlate ? source ?? undefined : undefined,
        plateVerified: trimmedPlate ? verified : false,
        plateDetections: detections,
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

  const slots = labeledMedia({
    kind: 'dumping',
    videoUri,
    photoCar,
    photoPerson,
    photoPlate,
    photos: [],
  });

  if (step === 'video' || step === 'car' || step === 'person' || step === 'plate') {
    const copy = {
      video: {
        kicker: 'Step 1 of 4',
        title: '5-second scene video',
        body: 'Tap Post and record. Maximum 5 seconds. Skip if you only have time for photos.',
        action: videoUri ? 'Retake video' : 'Record now',
      },
      car: {
        kicker: 'Step 2 of 4',
        title: 'Car picture',
        body: 'Take a photo of the vehicle. Crop it before saving.',
        action: photoCar ? 'Retake car picture' : 'Take car picture',
      },
      person: {
        kicker: 'Step 3 of 4',
        title: 'Person picture',
        body: 'Take a photo of the person if it is safe. Crop before saving. Skip if you cannot.',
        action: photoPerson ? 'Retake person picture' : 'Take person picture',
      },
      plate: {
        kicker: 'Step 4 of 4',
        title: 'Number plate picture',
        body: 'Take a close photo of the plate. Crop it before saving.',
        action: photoPlate ? 'Retake plate picture' : 'Take plate picture',
      },
    }[step];

    const preview =
      step === 'video' ? videoUri : step === 'car' ? photoCar : step === 'person' ? photoPerson : photoPlate;

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <GreenHero kicker={copy.kicker} title={copy.title} subtitle={copy.body} />
          {preview && step === 'video' ? <ClipPlayer uri={preview} style={styles.preview} /> : null}
          {preview && step !== 'video' ? (
            <Image source={{ uri: preview }} style={styles.preview} resizeMode="cover" />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={styles.primary}
            onPress={() => {
              if (step === 'video') void startVideo();
              else void captureSlot(step);
            }}>
            <Text style={styles.primaryText}>{copy.action}</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => setStep(NEXT[step])}>
            <Text style={styles.secondaryText}>{preview ? 'Use this and continue' : 'Skip'}</Text>
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
            kicker="Review evidence"
            title="Check what you captured"
            subtitle="Blank slots are fine if you only had time for a video. A DumpWatch reviewer must approve this post."
          />
          {slots.map((item) => (
            <View key={item.slot} style={styles.slotCard}>
              <Text style={styles.label}>{item.label}</Text>
              {item.uri && item.type === 'video' ? (
                <ClipPlayer uri={item.uri} style={styles.slotMedia} />
              ) : item.uri ? (
                <Image source={{ uri: item.uri }} style={styles.slotMedia} resizeMode="cover" />
              ) : (
                <View style={styles.slotEmpty}>
                  <Text style={styles.help}>Not captured</Text>
                </View>
              )}
              <Pressable
                style={styles.tiny}
                onPress={() => {
                  if (item.slot === 'scene') return;
                  setStep(item.slot);
                }}>
                <Text style={styles.tinyText}>{item.uri ? 'Retake' : 'Capture'}</Text>
              </Pressable>
            </View>
          ))}
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
          kicker="Last step"
          title="Finish the report"
          subtitle="Evidence is already attached. Add place and title last."
        />

        <Field label="Precise location">
          <Action label={locating ? 'Finding you…' : 'Use my current location'} onPress={useLocation} />
          <TextInput
            value={locationText}
            onChangeText={setLocationText}
            placeholder="Landmark, street, or settlement name"
            placeholderTextColor={colors.muted}
            style={[styles.input, { marginTop: 10 }]}
          />
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

        <View style={styles.card}>
          <Text style={styles.label}>Number plate</Text>
          {scanning ? <Text style={styles.help}>AI checking plates…</Text> : (
            <Text style={styles.help}>{plateStatusCopy(top?.confidence)}</Text>
          )}
          <TextInput
            value={plate}
            onChangeText={(value) => {
              setPlate(value);
              setPlateSource(top && value === top.rawText ? plateSource : 'user');
              setPlateVerified(false);
            }}
            placeholder="CA 123-456 or AB 12 CD GP"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            style={[styles.input, { marginTop: 10 }]}
          />
          {top ? (
            <Pressable
              style={styles.tiny}
              onPress={() => {
                setPlate(top.rawText);
                setPlateSource('ai_confirmed_by_user');
                setPlateConfidence(top.confidence);
                setPlateVerified(top.confidence >= 80);
              }}>
              <Text style={styles.tinyText}>Accept AI plate</Text>
            </Pressable>
          ) : null}
        </View>

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
            placeholder="What was dumped, if you had time to write"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.multiline]}
            multiline
          />
        </Field>

        <Field label="Title">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Short title for this dump"
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
  preview: { width: '100%', height: 240, borderRadius: 18, backgroundColor: colors.videoBg },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radii.input,
    paddingVertical: 16,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: colors.cream, fontSize: 17, fontWeight: '800' },
  secondary: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  secondaryText: { color: colors.heading, fontWeight: '800', fontSize: 15 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  slotCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  slotMedia: { width: '100%', height: 180, borderRadius: 12, marginTop: 8, backgroundColor: colors.videoBg },
  slotEmpty: {
    height: 80,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
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
    backgroundColor: colors.primary,
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
    borderColor: colors.mintBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: colors.mint,
  },
  chipOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.heading, fontSize: 12, fontWeight: '700' },
  chipOnText: { color: colors.cream },
  emojiPick: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
    borderWidth: 1.5,
    borderColor: colors.mintBorder,
  },
  emojiPickOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  emojiPickOff: { opacity: 0.35 },
  emojiText: { fontSize: 22 },
  tiny: { alignSelf: 'flex-start', marginTop: 8, minHeight: 36, justifyContent: 'center' },
  tinyText: { color: colors.heading, fontWeight: '800' },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.accent, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
