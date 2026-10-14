import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import { radii, type ThemeColors } from '@/lib/theme';
import { EMOJI_LIMIT, EMOJI_PALETTE, type EmojiReaction } from '@/lib/types';

export function EmojiBar({
  emojis,
  onPressEmoji,
  onAddEmoji,
}: {
  emojis?: EmojiReaction[];
  onPressEmoji: (emoji: string) => void;
  onAddEmoji?: (emoji: string) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const [picker, setPicker] = useState(false);
  const items = Array.isArray(emojis) ? emojis : [];
  const canAdd = Boolean(onAddEmoji) && items.length < EMOJI_LIMIT;
  const unused = EMOJI_PALETTE.filter((emoji) => !items.some((item) => item.emoji === emoji));

  return (
    <View>
      <View style={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.emoji}
            onPress={() => onPressEmoji(item.emoji)}
            style={[styles.chip, item.mine && styles.chipMine]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.count, item.mine && styles.countMine]}>{item.count}</Text>
          </Pressable>
        ))}
        {canAdd ? (
          <Pressable onPress={() => setPicker((open) => !open)} style={styles.addChip}>
            <Text style={styles.addText}>{picker ? 'Close' : '+ Emoji'}</Text>
          </Pressable>
        ) : null}
      </View>
      {picker && canAdd ? (
        <View style={styles.palette}>
          {unused.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                onAddEmoji?.(emoji);
                setPicker(false);
              }}
              style={styles.paletteBtn}>
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
          {unused.length === 0 ? <Text style={styles.limit}>No more emojis in the set.</Text> : null}
        </View>
      ) : null}
      {items.length >= EMOJI_LIMIT ? (
        <Text style={styles.limit}>This post has the 5-emoji limit.</Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36,
    borderWidth: 1.5,
    borderColor: colors.mintBorder,
    gap: 4,
  },
  chipMine: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  emoji: {
    fontSize: 18,
  },
  count: {
    color: colors.heading,
    fontWeight: '800',
    fontSize: 13,
  },
  countMine: {
    color: colors.cream,
  },
  addChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addText: {
    color: colors.heading,
    fontWeight: '800',
    fontSize: 12,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    backgroundColor: colors.mint,
    borderRadius: 14,
    padding: 10,
  },
  paletteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  limit: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
});
