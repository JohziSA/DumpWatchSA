import type { ImageSourcePropType } from 'react-native';

export const SEED_IMAGES: Record<string, ImageSourcePropType> = {
  'diepsloot-1': require('../assets/images/seed/diepsloot-1.jpg'),
  'diepsloot-2': require('../assets/images/seed/diepsloot-2.jpg'),
  'soweto-1': require('../assets/images/seed/soweto-1.jpg'),
  'soweto-2': require('../assets/images/seed/soweto-2.jpg'),
  'mitchells-1': require('../assets/images/seed/mitchells-1.jpg'),
  'mitchells-2': require('../assets/images/seed/mitchells-2.jpg'),
  'gqeberha-1': require('../assets/images/seed/gqeberha-1.jpg'),
  'gqeberha-2': require('../assets/images/seed/gqeberha-2.jpg'),
  'ethekwini-1': require('../assets/images/seed/ethekwini-1.jpg'),
  'ethekwini-2': require('../assets/images/seed/ethekwini-2.jpg'),
  'polokwane-1': require('../assets/images/seed/polokwane-1.jpg'),
  'rustenburg-1': require('../assets/images/seed/rustenburg-1.jpg'),
  'rustenburg-2': require('../assets/images/seed/rustenburg-2.jpg'),
  'kimberley-1': require('../assets/images/seed/kimberley-1.jpg'),
};

export const SEED_AUDIO: Record<string, number> = {
  'diepsloot-note': require('../assets/audio/diepsloot-note.wav'),
};

export const SEED_PLATES: Record<string, string> = {
  'diepsloot-1': 'FP 32 GP',
  'diepsloot-2': 'FP 32 GP',
  'ethekwini-1': 'ND 456-789',
  'ethekwini-2': 'ND 456-789',
  'kimberley-1': 'CY 210-334',
  'mitchells-2': 'CA 123-456',
  'gqeberha-1': 'CB 882-014',
};

export function mediaSource(url: string | null | undefined): ImageSourcePropType | undefined {
  if (!url) return undefined;
  if (url.startsWith('seed:')) {
    return SEED_IMAGES[url.slice(5)];
  }
  return { uri: url };
}

export function audioSource(url: string | null | undefined): number | { uri: string } | undefined {
  if (!url) return undefined;
  if (url.startsWith('seed:')) {
    return SEED_AUDIO[url.slice(5)];
  }
  return { uri: url };
}

export function seedKeyFromUrl(url: string | null | undefined): string | null {
  if (!url?.startsWith('seed:')) return null;
  return url.slice(5);
}
