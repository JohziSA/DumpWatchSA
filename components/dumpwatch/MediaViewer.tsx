import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mediaSource } from '@/lib/media';
import type { LabeledMedia } from '@/lib/types';
import { useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

import { ClipPlayer } from './ClipPlayer';

const { width, height } = Dimensions.get('window');

export function MediaViewer({
  items,
  startIndex,
  visible,
  onClose,
}: {
  items: LabeledMedia[];
  startIndex: number;
  visible: boolean;
  onClose: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(startIndex);
  const filled = items;

  useEffect(() => {
    if (!visible) return;
    setIndex(startIndex);
    requestAnimationFrame(() => {
      scroller.current?.scrollTo({ x: startIndex * width, animated: false });
    });
  }, [visible, startIndex]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(filled.length - 1, next));
    scroller.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text style={styles.label}>{filled[index]?.label ?? 'Media'}</Text>
          <Text style={styles.count}>
            {index + 1}/{filled.length}
          </Text>
        </View>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={onScroll}
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: startIndex * width, y: 0 }}>
          {filled.map((item) => (
            <View key={item.slot} style={styles.page}>
              {item.uri && item.type === 'video' ? (
                <ClipPlayer uri={item.uri} style={styles.media} />
              ) : item.uri && item.type === 'image' ? (
                <Image source={mediaSource(item.uri)} style={styles.media} resizeMode="contain" />
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>{item.label}</Text>
                  <Text style={styles.emptyText}>Not captured. This post still needs approval.</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        <View style={styles.nav}>
          <Pressable onPress={() => go(index - 1)} style={styles.navBtn} disabled={index === 0}>
            <Text style={[styles.navText, index === 0 && styles.disabled]}>Previous</Text>
          </Pressable>
          <Pressable
            onPress={() => go(index + 1)}
            style={styles.navBtn}
            disabled={index >= filled.length - 1}>
            <Text style={[styles.navText, index >= filled.length - 1 && styles.disabled]}>Next</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.videoBg },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  close: { minHeight: 44, justifyContent: 'center' },
  closeText: { color: colors.cream, fontWeight: '800', fontSize: 16 },
  label: { color: colors.kicker, fontWeight: '800', fontSize: 14, flex: 1, textAlign: 'center' },
  count: { color: colors.cream, fontWeight: '700', minWidth: 48, textAlign: 'right' },
  page: { width, height: height * 0.72, justifyContent: 'center' },
  media: { width, height: height * 0.72 },
  empty: { alignItems: 'center', padding: 24 },
  emptyTitle: { color: colors.cream, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyText: { color: colors.kicker, textAlign: 'center', lineHeight: 22 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  navText: { color: colors.cream, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.35 },
});
