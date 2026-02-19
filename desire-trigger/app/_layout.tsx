import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import '../css-interop';
import 'react-native-reanimated';https://github.com/kc3hack/2026_team24/pull/20/conflict?name=desire-trigger%252Ftypes%252Findex.ts&ancestor_oid=5db2db7ed8931d463d6e6f3550646f7d9ad1d95b&base_oid=12e4a0ad11431f8ec04e6b9d7cde2d8297358757&head_oid=67adaa0e0f58728aad4cb4e4a6e9e3ffc10fb38a
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
          options={{ presentation: 'fullScreenModal' }}
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