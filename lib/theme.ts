export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  card: string;
  primary: string;
  forest: string;
  leaf: string;
  mint: string;
  kicker: string;
  secondary: string;
  accent: string;
  text: string;
  heading: string;
  headingWater: string;
  muted: string;
  pill: string;
  sageShadow: string;
  line: string;
  placeholder: string;
  verified: string;
  warning: string;
  white: string;
  cream: string;
  inputBg: string;
  water: string;
  waterMint: string;
  waterBand: string;
  waterBorder: string;
  waterDeep: string;
  gold: string;
  switchTrackOff: string;
  onForestFaint: string;
  tabBar: string;
  tabInactive: string;
  clay: string;
  clayBorder: string;
  clayText: string;
  overlay: string;
  videoBg: string;
  videoBgWater: string;
  heroCopy: string;
  mintBorder: string;
  waterMintBorder: string;
  shadowDump: string;
  shadowWater: string;
  photoFade: string;
  photoFadeWater: string;
  fabShadow: string;
};

export const lightColors: ThemeColors = {
  background: '#E3EBE0',
  card: '#F1F6EF',
  primary: '#2C7F46',
  forest: '#1A5530',
  leaf: '#348C4C',
  mint: '#C8E0C6',
  kicker: '#C8E0C6',
  secondary: '#2C6A5A',
  accent: '#B87458',
  text: '#163225',
  heading: '#1A5530',
  headingWater: '#185F6B',
  muted: '#4A6754',
  pill: '#D0E6CE',
  sageShadow: 'rgba(26, 85, 48, 0.2)',
  line: '#B3CDB0',
  placeholder: '#C0D8BE',
  verified: '#2C7F46',
  warning: '#B87458',
  white: '#F1F6EF',
  cream: '#EEF3EB',
  inputBg: '#EEF3EB',
  water: '#185F6B',
  waterMint: '#C2DDE1',
  waterBand: '#D0E4E6',
  waterBorder: '#4A97A2',
  waterDeep: '#0E4A54',
  gold: '#E2C36A',
  switchTrackOff: '#B3CDB0',
  onForestFaint: 'rgba(238, 243, 235, 0.2)',
  tabBar: '#1A5530',
  tabInactive: '#86B090',
  clay: '#F0E2D8',
  clayBorder: '#DCC3B3',
  clayText: '#B87458',
  overlay: 'rgba(47, 58, 50, 0.4)',
  videoBg: '#102418',
  videoBgWater: '#0B3A42',
  heroCopy: '#D4E8D2',
  mintBorder: '#86C084',
  waterMintBorder: '#74B0B8',
  shadowDump: '0 10px 20px rgba(26, 85, 48, 0.14)',
  shadowWater: '0 10px 22px rgba(24, 95, 107, 0.24)',
  photoFade: 'rgba(26, 85, 48, 0.16)',
  photoFadeWater: 'rgba(24, 95, 107, 0.2)',
  fabShadow: '0 8px 16px rgba(184, 116, 88, 0.4)',
};

export const darkColors: ThemeColors = {
  background: '#0F1712',
  card: '#1B2920',
  primary: '#5AA56C',
  forest: '#142E22',
  leaf: '#3C8A50',
  mint: '#24382C',
  kicker: '#C8DCCB',
  secondary: '#7AB392',
  accent: '#C48B72',
  text: '#E8F2E6',
  heading: '#E8F2E6',
  headingWater: '#B5E0E6',
  muted: '#B4C9B8',
  pill: '#24382C',
  sageShadow: 'rgba(0, 0, 0, 0.35)',
  line: '#2C4436',
  placeholder: '#1E2E24',
  verified: '#5AA56C',
  warning: '#C48B72',
  white: '#1B2920',
  cream: '#E4EEDC',
  inputBg: '#24382C',
  water: '#154850',
  waterMint: '#1A3338',
  waterBand: '#132226',
  waterBorder: '#3A6E78',
  waterDeep: '#0E333A',
  gold: '#C9B15F',
  switchTrackOff: 'rgba(228, 238, 220, 0.28)',
  onForestFaint: 'rgba(228, 238, 220, 0.16)',
  tabBar: '#102018',
  tabInactive: '#7A9A82',
  clay: '#3A2E28',
  clayBorder: '#5A463C',
  clayText: '#E0B8A4',
  overlay: 'rgba(10, 16, 12, 0.55)',
  videoBg: '#0C1812',
  videoBgWater: '#0B1E22',
  heroCopy: '#C5D8C8',
  mintBorder: '#3A5A44',
  waterMintBorder: '#3A6E78',
  shadowDump: '0 10px 20px rgba(0, 0, 0, 0.35)',
  shadowWater: '0 10px 22px rgba(0, 0, 0, 0.35)',
  photoFade: 'rgba(15, 30, 22, 0.35)',
  photoFadeWater: 'rgba(20, 50, 55, 0.4)',
  fabShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
};

export const palettes = {
  light: lightColors,
  dark: darkColors,
} as const;

export const radii = {
  card: 18,
  pill: 999,
  input: 16,
};

/** Light palette fallback while a screen is still converting. Prefer useAppTheme(). */
export const colors = lightColors;
