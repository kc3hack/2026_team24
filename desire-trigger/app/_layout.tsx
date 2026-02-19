import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import '../css-interop';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 全画面共通でヘッダーを非表示に設定 */}
      <Stack screenOptions={{ headerShown: false }}>

        {/* 🚀 スタート画面関連：スライドを無効化し、フェードアニメーションを適用 */}
        <Stack.Screen
          name="index"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="welcome"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="setup"
          options={{ animation: 'fade' }}
        />

        {/* 🚀 モーダル画面：これらはiOS標準のポップアップ動作を維持 */}
        <Stack.Screen
          name="question"
          options={{ animation: 'fade' }}
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

      {/* 宇宙背景に合わせて時計やアイコンを白に固定 */}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}