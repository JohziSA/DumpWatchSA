import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

export default function NotFoundScreen() {
  const styles = useThemedStyles(createStyles);
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to DumpWatch SA</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
