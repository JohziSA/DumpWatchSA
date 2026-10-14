import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';

import { loadThemePreference, saveThemePreference } from '@/lib/storage';
import { palettes, type ColorScheme, type ThemeColors } from '@/lib/theme';

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: ThemeColors;
  setScheme: (scheme: ColorScheme) => Promise<void>;
  toggleScheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyNativeScheme(scheme: ColorScheme) {
  if (typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(scheme);
  }
}

export function WatchThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>('light');

  useEffect(() => {
    let cancelled = false;
    loadThemePreference().then((loaded) => {
      if (cancelled) return;
      setSchemeState(loaded);
      applyNativeScheme(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setScheme = useCallback(async (next: ColorScheme) => {
    setSchemeState(next);
    applyNativeScheme(next);
    await saveThemePreference(next);
  }, []);

  const toggleScheme = useCallback(async () => {
    await setScheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setScheme]);

  const value = useMemo(
    () => ({
      scheme,
      colors: palettes[scheme],
      setScheme,
      toggleScheme,
    }),
    [scheme, setScheme, toggleScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within WatchThemeProvider');
  }
  return ctx;
}

export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
