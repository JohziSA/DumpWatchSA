import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { mediaSource } from '@/lib/media';
import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';

export function PhotoGallery({
  photos,
  highlightIndex,
  box,
}: {
  photos: string[];
  highlightIndex?: number;
  box?: { x: number; y: number; w: number; h: number };
}) {
  const styles = useThemedStyles(createStyles);
  if (!photos?.length) {
    return <View style={styles.placeholder} />;
  }

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.scroller}>
      {photos.map((uri, index) => {
        const source = mediaSource(uri);
        const showBox = highlightIndex === index && box;
        return (
          <View key={`${uri}-${index}`} style={styles.frame}>
            {source ? <Image source={source} style={styles.image} resizeMode="cover" /> : null}
            {showBox ? (
              <View
                style={[
                  styles.box,
                  {
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    width: `${box.w * 100}%`,
                    height: `${box.h * 100}%`,
                  },
                ]}
              />
            ) : null}
            <View style={styles.count}>
              <Text style={styles.countText}>
                {index + 1} / {photos.length}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 32, 520);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  scroller: {
    marginHorizontal: -16,
  },
  frame: {
    width: CARD_WIDTH,
    height: 320,
    marginHorizontal: 16,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
    position: 'relative',
  },
  placeholder: {
    height: 320,
    borderRadius: radii.card,
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 6,
    pointerEvents: 'none',
  },
  count: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: colors.sageShadow,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '600',
  },
});
