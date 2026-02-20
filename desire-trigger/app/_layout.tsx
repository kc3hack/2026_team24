import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import '../css-interop';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>

          {/* 各画面の設定 */}
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="setup" options={{ animation: 'fade' }} />

          {/* 🚀 ここが最重要の修正ポイント！ */}
          <Stack.Screen
            name="question"
            options={{ 
              // 1. presentationを 'transparentModal' にするか、指定を外します。
              // fullScreenModalは「下からスライド」が強制されるため、これが原因でした。
              presentation: 'card', 
              
              // 2. animationを確実に 'none' に。
              animation: 'fade', 
              
              // 3. 背景色を宇宙の色に合わせておくと、一瞬のチラつきも防げます。
              contentStyle: { backgroundColor: '#020617' }
            }}
          />

          <Stack.Screen
            name="reflection"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
        </Stack>

        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}