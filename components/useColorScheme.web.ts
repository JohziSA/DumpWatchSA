import { useColorScheme as useColorSchemeCore } from 'react-native';

export function useColorScheme() {
  const coreScheme = useColorSchemeCore();
  if (coreScheme === 'dark' || coreScheme === 'light') return coreScheme;
  return 'light';
}
