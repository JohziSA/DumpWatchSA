import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSeedReports } from './seed';
import type { ColorScheme } from './theme';
import {
  inferWaterIssue,
  type LocalProfile,
  type ProsecutionStatus,
  type Report,
  type WaterIssue,
} from './types';

const WATER_ISSUES: WaterIssue[] = ['sewer', 'leak', 'no_water', 'flood', 'other'];

const REPORTS_KEY = 'dumpwatch.reports.v5';
const LEGACY_REPORTS_KEY = 'dumpwatch.reports.v4';
const PROFILE_KEY = 'dumpwatch.profile.v1';
const THEME_KEY = 'dumpwatch.theme.v1';

function prosecutionFromStatus(status: string | undefined): ProsecutionStatus {
  if (status === 'under_review' || status === 'proven' || status === 'prosecuted') {
    return status;
  }
  return 'not_started';
}

export function normalizeReport(raw: Partial<Report> | null | undefined): Report {
  const status = raw?.status ?? 'open';
  return {
    id: String(raw?.id ?? ''),
    kind: raw?.kind === 'water' ? 'water' : 'dumping',
    waterIssue:
      raw?.kind === 'water'
        ? WATER_ISSUES.includes(raw?.waterIssue as WaterIssue)
          ? (raw.waterIssue as WaterIssue)
          : inferWaterIssue(String(raw?.title ?? ''), String(raw?.description ?? ''))
        : undefined,
    authorId: String(raw?.authorId ?? ''),
    authorName: String(raw?.authorName ?? 'Resident'),
    title: String(raw?.title ?? ''),
    description: String(raw?.description ?? ''),
    photos: Array.isArray(raw?.photos) ? raw.photos.filter(Boolean) : [],
    videoUri: raw?.videoUri,
    photoCar: raw?.photoCar ?? (Array.isArray(raw?.photos) ? raw.photos[0] : undefined),
    photoPerson: raw?.photoPerson ?? (Array.isArray(raw?.photos) ? raw.photos[1] : undefined),
    photoPlate: raw?.photoPlate ?? (Array.isArray(raw?.photos) ? raw.photos[2] : undefined),
    photoScene: raw?.photoScene ?? (raw?.kind === 'water' && Array.isArray(raw?.photos) ? raw.photos[0] : undefined),
    audioUri: raw?.audioUri,
    numberPlate: raw?.numberPlate,
    plateNormalized: raw?.plateNormalized,
    plateConfidence: raw?.plateConfidence,
    plateSource: raw?.plateSource,
    plateVerified: Boolean(raw?.plateVerified),
    plateDetections: Array.isArray(raw?.plateDetections) ? raw.plateDetections : [],
    locationText: raw?.locationText,
    lat: raw?.lat,
    lng: raw?.lng,
    province: String(raw?.province ?? ''),
    occurredAt: String(raw?.occurredAt ?? new Date().toISOString()),
    status,
    prosecutionStatus: raw?.prosecutionStatus ?? prosecutionFromStatus(status),
    emojis: Array.isArray(raw?.emojis) ? raw.emojis : [],
    deletionReason: raw?.deletionReason,
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
  };
}

export async function loadReports(): Promise<Report[]> {
  try {
    const raw = (await AsyncStorage.getItem(REPORTS_KEY)) ?? (await AsyncStorage.getItem(LEGACY_REPORTS_KEY));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Report>[];
      if (Array.isArray(parsed) && parsed.length) {
        const normalized = parsed.map((item) => normalizeReport(item));
        const existingIds = new Set(normalized.map((item) => item.id));
        const missingSeed = createSeedReports().filter((item) => !existingIds.has(item.id));
        const merged = missingSeed.length ? [...missingSeed, ...normalized] : normalized;
        await saveReports(merged);
        return merged;
      }
    }
  } catch {
    // Fall through to seed data.
  }
  const seeded = createSeedReports();
  await saveReports(seeded);
  return seeded;
}

export async function saveReports(reports: Report[]): Promise<void> {
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export async function loadProfile(): Promise<LocalProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw) as LocalProfile;
    }
  } catch {
    // ignore
  }
  return { displayName: 'Resident' };
}

export async function saveProfile(profile: LocalProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadThemePreference(): Promise<ColorScheme> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // ignore
  }
  return 'light';
}

export async function saveThemePreference(scheme: ColorScheme): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, scheme);
}
