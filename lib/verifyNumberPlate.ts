import { SEED_PLATES, seedKeyFromUrl } from './media';

export type PlateScanInput = { uri: string };

export type PlateScanHit = {
  rawText: string;
  normalized: string;
  confidence: number;
  photoIndex: number;
  boundingBox?: { x: number; y: number; w: number; h: number };
};

const SAMPLE_PLATES = [
  'CA 123-456',
  'CY 210-334',
  'ND 456-789',
  'NP 118-220',
  'CB 882-014',
  'FP 32 GP',
  'HJ 18 FS',
  'MM 44 MP',
  'YBX 412 NW',
  'AB 12 CD GP',
  'CF 90 WC',
  'L 334-812',
  'ZN 21 JK',
  'NC 55 LM',
];

export function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function hashString(value: string): number {
  const text = value ?? '';
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Local mock of a vision/OCR number-plate scan.
 * Replace this function later with a real vision API call.
 */
export async function verifyNumberPlateFromImages(
  images: PlateScanInput[],
): Promise<PlateScanHit[]> {
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const hits: PlateScanHit[] = [];

  images.forEach((image, photoIndex) => {
    const seedKey = seedKeyFromUrl(image.uri);
    const known = seedKey ? SEED_PLATES[seedKey] : undefined;
    const h = hashString(image.uri || `img-${photoIndex}`);

    if (known) {
      hits.push({
        rawText: known,
        normalized: normalizePlate(known),
        confidence: 88 + (h % 9),
        photoIndex,
        boundingBox: { x: 0.2, y: 0.46, w: 0.28, h: 0.12 },
      });
      return;
    }

    const roll = h % 10;
    if (roll <= 4) {
      const plate = SAMPLE_PLATES[h % SAMPLE_PLATES.length];
      hits.push({
        rawText: plate,
        normalized: normalizePlate(plate),
        confidence: 55 + (h % 38),
        photoIndex,
        boundingBox: { x: 0.18, y: 0.5, w: 0.3, h: 0.11 },
      });
    }
  });

  return hits.sort((a, b) => b.confidence - a.confidence);
}

export function plateStatusFromConfidence(confidence?: number): 'verified' | 'possible' | 'none' {
  if (confidence == null) return 'none';
  if (confidence >= 80) return 'verified';
  if (confidence >= 50) return 'possible';
  return 'none';
}

export function plateStatusCopy(confidence?: number): string {
  const status = plateStatusFromConfidence(confidence);
  if (status === 'verified') return 'AI verified plate';
  if (status === 'possible') return 'Possible plate — please confirm';
  return 'No plate detected — enter manually if you saw a vehicle.';
}
