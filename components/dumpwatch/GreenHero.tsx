import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';

import { DarkModeSwitch } from './DarkModeSwitch';

export function GreenHero({
  kicker,
  title,
  subtitle,
  variant = 'dump',
  showDarkSwitch = false,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  variant?: 'dump' | 'water';
  showDarkSwitch?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.hero, variant === 'water' && styles.heroWater]}>
      <View style={[styles.blob, styles.blobOne, variant === 'water' && styles.blobWater]} />
      <View style={[styles.blob, styles.blobTwo, variant === 'water' && styles.blobWaterTwo]} />
      <View style={[styles.blob, styles.blobThree, variant === 'water' && styles.blobWater]} />
      <View style={styles.topBar}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : <View />}
        {showDarkSwitch ? <DarkModeSwitch compact /> : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  hero: {
    backgroundColor: colors.forest,
    borderRadius: radii.card,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    marginBottom: 18,
    overflow: 'hidden',
    minHeight: 148,
    justifyContent: 'flex-end',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
    zIndex: 2,
  },
  heroWater: {
    backgroundColor: colors.water,
  },
  blobWater: {
    backgroundColor: colors.waterBorder,
  },
  blobWaterTwo: {
    backgroundColor: colors.waterMint,
    opacity: 0.22,
  },
  blob: {
    position: 'absolute',
    backgroundColor: colors.leaf,
    opacity: 0.22,
    borderRadius: 999,
  },
  blobOne: {
    width: 160,
    height: 160,
    right: -40,
    bottom: -50,
  },
  blobTwo: {
    width: 90,
    height: 90,
    right: 50,
    top: 20,
    backgroundColor: colors.mint,
    opacity: 0.18,
  },
  blobThree: {
    width: 70,
    height: 70,
    left: -18,
    bottom: -22,
    backgroundColor: colors.primary,
    opacity: 0.35,
  },
  kicker: {
    color: colors.kicker,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  title: {
    color: colors.cream,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.heroCopy,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: '88%',
  },
});
