import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';
import { SA_PROVINCES } from '@/lib/types';

export function ProvinceChips({
  selected,
  onSelectAll,
  onSelectProvince,
  tone = 'dump',
}: {
  selected: 'all' | string;
  onSelectAll: () => void;
  onSelectProvince: (province: string) => void;
  tone?: 'dump' | 'water';
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <Chip label="All provinces" active={selected === 'all'} onPress={onSelectAll} tone={tone} />
      {SA_PROVINCES.map((province) => (
        <Chip
          key={province}
          label={province}
          active={selected === province}
          onPress={() => onSelectProvince(province)}
          tone={tone}
        />
      ))}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  tone,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  tone: 'dump' | 'water';
}) {
  const styles = useThemedStyles(createStyles);
  const water = tone === 'water';
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, water && styles.chipWater, active && (water ? styles.activeWater : styles.active)]}>
      <Text style={[styles.text, water && styles.textWater, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.mintBorder,
  },
  active: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipWater: {
    backgroundColor: colors.waterMint,
    borderColor: colors.waterMintBorder,
  },
  activeWater: {
    backgroundColor: colors.water,
    borderColor: colors.water,
  },
  text: {
    color: colors.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  textWater: {
    color: colors.headingWater,
  },
  activeText: {
    color: colors.cream,
  },
});
