import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
  });
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="login" />
  <Stack.Screen name="signup" />
  <Stack.Screen name="dashboard" />
  <Stack.Screen name="store/[storeId]" />
  <Stack.Screen name="category/[categoryId]" />
  <Stack.Screen name="item/[itemId]" />
  <Stack.Screen name="item/add" />
  <Stack.Screen name="item/edit" />
  <Stack.Screen name="category/edit" />
  <Stack.Screen name="store/edit" />
  <Stack.Screen name="issue/index" />
  <Stack.Screen name="issue/add" />
</Stack>

        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </PaperProvider>
  );
}
