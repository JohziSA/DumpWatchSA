import { StyleSheet, Switch, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

export function DarkModeSwitch({ compact = false }: { compact?: boolean }) {
  const { colors, scheme, setScheme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const dark = scheme === 'dark';

  const control = (
    <Switch
      value={dark}
      onValueChange={(on) => void setScheme(on ? 'dark' : 'light')}
      trackColor={{ false: colors.switchTrackOff, true: colors.leaf }}
      thumbColor={colors.cream}
      accessibilityLabel="Dark mode"
    />
  );

  if (compact) {
    return (
      <View style={styles.compact}>
        <Text style={styles.compactLabel}>Dark</Text>
        {control}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>Dark mode</Text>
        <Text style={styles.help}>
          {dark ? 'Deep civic green. Saved on this device.' : 'Turn on a deep civic green theme. Saved on this device.'}
        </Text>
      </View>
      {control}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    compact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      zIndex: 2,
      minHeight: 44,
    },
    compactLabel: {
      color: colors.cream,
      fontSize: 13,
      fontWeight: '800',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    copy: {
      flex: 1,
    },
    label: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    help: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
  });
