import { EMOJI_LIMIT, type EmojiReaction } from './types';

export function pressEmoji(list: EmojiReaction[] | undefined, emoji: string): EmojiReaction[] {
  const safe = Array.isArray(list) ? list : [];
  const current = safe.find((item) => item.emoji === emoji);
  if (!current) {
    if (safe.length >= EMOJI_LIMIT) return safe;
    return [...safe, { emoji, count: 1, mine: true }];
  }
  if (current.mine) {
    const nextCount = current.count - 1;
    if (nextCount <= 0) {
      return safe.filter((item) => item.emoji !== emoji);
    }
    return safe.map((item) =>
      item.emoji === emoji ? { ...item, count: nextCount, mine: false } : item,
    );
  }
  return safe.map((item) =>
    item.emoji === emoji ? { ...item, count: item.count + 1, mine: true } : item,
  );
}

export function addEmoji(list: EmojiReaction[] | undefined, emoji: string): EmojiReaction[] {
  const safe = Array.isArray(list) ? list : [];
  if (safe.some((item) => item.emoji === emoji)) {
    return pressEmoji(safe, emoji);
  }
  if (safe.length >= EMOJI_LIMIT) return safe;
  return [...safe, { emoji, count: 1, mine: true }];
}
