export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const;

export type SaProvince = (typeof SA_PROVINCES)[number];

export type PlateSource = 'ai' | 'user' | 'ai_confirmed_by_user';

export type ReportStatus =
  | 'pending_approval'
  | 'open'
  | 'under_review'
  | 'proven'
  | 'prosecuted'
  | 'deletion_requested';

export type ReportKind = 'dumping' | 'water';

export type WaterIssue = 'sewer' | 'leak' | 'no_water' | 'flood' | 'other';

export const WATER_ISSUE_OPTIONS: { id: WaterIssue; label: string }[] = [
  { id: 'sewer', label: 'Sewer / sewage' },
  { id: 'leak', label: 'Leak / burst' },
  { id: 'no_water', label: 'No water' },
  { id: 'flood', label: 'Flooding' },
  { id: 'other', label: 'Other' },
];

export function waterIssueLabel(issue?: WaterIssue): string | undefined {
  return WATER_ISSUE_OPTIONS.find((item) => item.id === issue)?.label;
}

export function inferWaterIssue(title: string, description: string): WaterIssue {
  const haystack = `${title} ${description}`.toLowerCase();
  if (haystack.includes('sewer') || haystack.includes('sewage')) return 'sewer';
  if (haystack.includes('no water') || haystack.includes('dry tap') || haystack.includes('communal tap')) {
    return 'no_water';
  }
  if (haystack.includes('flood')) return 'flood';
  if (haystack.includes('leak') || haystack.includes('burst') || haystack.includes('pipe')) return 'leak';
  return 'other';
}

export type MediaSlot = 'video' | 'car' | 'person' | 'plate' | 'scene';

export type LabeledMedia = {
  slot: MediaSlot;
  label: string;
  type: 'video' | 'image';
  uri?: string;
};

export type ProsecutionStatus = 'not_started' | 'under_review' | 'proven' | 'prosecuted';

export type EmojiReaction = {
  emoji: string;
  count: number;
  mine: boolean;
};

export const EMOJI_PALETTE = ['😡', '😤', '😢', '🙏', '💚', '👍', '⚠️', '📍', '🚮', '🌱', '👀', '🤝', '💧'] as const;
export const EMOJI_LIMIT = 5;

export type PlateDetection = {
  rawText: string;
  normalized: string;
  confidence: number;
  photoIndex: number;
  accepted: boolean;
  boundingBox?: { x: number; y: number; w: number; h: number };
};

export type Report = {
  id: string;
  kind: ReportKind;
  waterIssue?: WaterIssue;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  photos: string[];
  videoUri?: string;
  photoCar?: string;
  photoPerson?: string;
  photoPlate?: string;
  photoScene?: string;
  audioUri?: string;
  numberPlate?: string;
  plateNormalized?: string;
  plateConfidence?: number;
  plateSource?: PlateSource;
  plateVerified: boolean;
  plateDetections: PlateDetection[];
  locationText?: string;
  lat?: number;
  lng?: number;
  province: string;
  occurredAt: string;
  status: ReportStatus;
  prosecutionStatus: ProsecutionStatus;
  emojis: EmojiReaction[];
  deletionReason?: string;
  createdAt: string;
};

export type LocalProfile = {
  displayName: string;
};

export const LOCAL_AUTHOR_ID = 'local-resident';
