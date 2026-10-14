import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';

type Tone = 'sage' | 'clay' | 'stone' | 'water';

export function TagPill({ label, tone = 'sage' }: { label: string; tone?: Tone }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View
      style={[
        styles.pill,
        tone === 'clay' && styles.clay,
        tone === 'stone' && styles.stone,
        tone === 'water' && styles.water,
      ]}>
      <Text
        style={[
          styles.text,
          tone === 'clay' && styles.clayText,
          tone === 'water' && styles.waterText,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  pill: {
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    minHeight: 28,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.mintBorder,
  },
  clay: {
    backgroundColor: colors.clay,
    borderColor: colors.clayBorder,
  },
  stone: {
    backgroundColor: colors.placeholder,
    borderColor: colors.line,
  },
  text: {
    color: colors.heading,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  clayText: {
    color: colors.clayText,
  },
  water: {
    backgroundColor: colors.waterMint,
    borderColor: colors.waterMintBorder,
  },
  waterText: {
    color: colors.headingWater,
  },
});
