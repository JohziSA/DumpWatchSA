import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/context/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cream,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBar,
          height: Platform.OS === 'ios' ? 92 : 76,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          paddingBottom: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Post',
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <Pressable onPress={props.onPress} style={styles.postHit} accessibilityRole="button" accessibilityLabel="Post a report">
              <View style={styles.postFab}>
                <SymbolView
                  name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                  tintColor={colors.cream}
                  size={34}
                />
              </View>
              <Text style={styles.postLabel}>POST</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    postHit: {
      flex: 1,
      alignItems: 'center',
      top: -18,
    },
    postFab: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.cream,
      boxShadow: colors.fabShadow,
    },
    postLabel: {
      marginTop: 4,
      color: colors.cream,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
  });
