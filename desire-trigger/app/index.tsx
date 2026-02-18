import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  // 常にタイトル画面へ (Matrix演出のため)
  return <Redirect href="/welcome" />;
}