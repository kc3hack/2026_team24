import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function QuestionLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          // 🚀 遷移をフェードに変更（スライドを無効化）
          animation: 'fade', 
          contentStyle: { backgroundColor: '#121212' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="answer" />
        <Stack.Screen name="complete" />
      </Stack>
    </GestureHandlerRootView>
  );
}