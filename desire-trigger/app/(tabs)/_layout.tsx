import { Tabs, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function TabLayout() {
  const router = useRouter();
  const [todayAnswered, setTodayAnswered] = useState(true); // デフォルトはtrue（制限なし）
  const [isFirstTime, setIsFirstTime] = useState(false);

  // ホーム画面がフォーカスされたときにチェック
  useFocusEffect(
    useCallback(() => {
      checkDiagnosticStatus();
    }, [])
  );

  const checkDiagnosticStatus = async () => {
    try {
      // profile_idの存在確認（初回かどうか）
      const profileId = await AsyncStorage.getItem('profile_id');
      if (!profileId) {
        setIsFirstTime(true);
        setTodayAnswered(false);
        return;
      }

      // current_diagnostic_idの確認
      const diagnosticId = await AsyncStorage.getItem('current_diagnostic_id');

      // 診断レコードがない場合は初回とみなす
      if (!diagnosticId) {
        setIsFirstTime(true);
        setTodayAnswered(false);
        return;
      }

      // 回答済みかチェック（answersが存在するか）
      const answersStr = await AsyncStorage.getItem('current_answers');
      const answers = answersStr ? JSON.parse(answersStr) : [];

      if (answers.length > 0) {
        setTodayAnswered(true);
        setIsFirstTime(false);
      } else {
        setTodayAnswered(false);
        setIsFirstTime(true);
      }
    } catch (e) {
      console.error('Failed to check diagnostic status:', e);
    }
  };

  const handleTabPress = (tabName: string) => {
    // ホームタブは常に許可
    if (tabName === 'index') {
      return true;
    }

    // 初回かつ未回答の場合は他のタブを制限
    if (!todayAnswered && isFirstTime) {
      Alert.alert(
        '診断が必要です',
        'まず診断を完了してください。ホーム画面から診断を開始できます。',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#a78bfa', // calm-500
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
        }
      }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split('-')[0];
          if (!handleTabPress(routeName || '')) {
            e.preventDefault();
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: '分析',
          tabBarIcon: ({ color }) => <Feather name="pie-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="action"
        options={{
          title: '行動',
          tabBarIcon: ({ color }) => <Feather name="activity" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
