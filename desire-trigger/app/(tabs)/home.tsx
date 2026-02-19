import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Animated, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMockStore } from '../../store/mockStore';

// 🦾 メカ・ハッカー風タスクカード
const HackerTaskCard = ({ title, tag, time, color }: { title: string, tag: string, time: string, color: string }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const neonColor = color === 'Quick' ? '#06B6D4' : color === 'Core' ? '#3B82F6' : '#8B5CF6';

  const handlePressIn = () => {
    if (isCompleted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(progress, { toValue: 1, duration: 800, useNativeDriver: false }).start(({ finished }) => {
      if (finished) {
        setIsCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  };

  const handlePressOut = () => {
    if (!isCompleted) Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} className={`relative mb-3 overflow-hidden rounded-xl border ${isCompleted ? 'border-green-500/50 bg-green-900/20' : 'border-gray-700 bg-gray-900'}`}>
      <Animated.View style={{ width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: isCompleted ? 'transparent' : neonColor, opacity: 0.4, position: 'absolute', height: '100%' }} />
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-6 h-6 mr-4 items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
            {isCompleted && <Feather name="check" size={14} color="black" />}
          </View>
          <View>
            <Text className={`font-bold text-base ${isCompleted ? 'text-green-400 line-through' : 'text-gray-200'}`}>{title}</Text>
            {!isCompleted && <Text style={{ color: neonColor }} className="text-[10px] font-bold mt-1">[{tag}] {time}</Text>}
          </View>
        </View>
        {isCompleted && <Text className="text-green-500 font-bold text-xs">[DONE]</Text>}
      </View>
    </Pressable>
  );
};

// 🏠 ホーム画面本体
export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("...");
  const { resetQuestions } = useMockStore();

  // 🛡️ 画面表示のたびにデータをロード
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [debugStatus, setDebugStatus] = useState<string | null>(null);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(true); // デフォルトは隠す

  // 🛡️ 画面表示のたびにデータをロード
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const name = await AsyncStorage.getItem('userName');
          if (!name) {
            router.replace('/setup');
          } else {
            setUserName(name);
          }

          // 今日の質問回答状況をチェック
          // 今日の質問回答状況をチェック
          const isDone = await AsyncStorage.getItem('dailyMissionCompleted');
          setHasAnsweredToday(isDone === 'true');

        } catch (e) { console.error(e); }
      };
      load();
    }, [])
  );

  // 💥 システムリセット
  // 💥 システムリセット
  const handleReset = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setDebugStatus("タイトル画面へ戻ります...");

    setTimeout(async () => {
      const keys = ['hasLaunched', 'userName', 'ageGroup', 'lifestyle', 'interest', 'jobType', 'techStack', 'currentMode', 'notifTime', 'weekdayFreeTime', 'weekendFreeTime', 'lastQuestionDate', 'dailyMissionCompleted'];
      await AsyncStorage.multiRemove(keys);
      resetQuestions();
      router.replace('/welcome');
    }, 3000); // 3秒待機
  };

  const handleNextDayDebug = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDebugStatus("次の日に移行します...");

    setTimeout(async () => {
      await AsyncStorage.setItem('dailyMissionCompleted', 'false'); // フラグを下げる
      // 日付も消して念のためリセット（または日付はずらしてもいいが、今回はシンプルに未完了にする）
      await AsyncStorage.removeItem('lastQuestionDate');
      setHasAnsweredToday(false);
      setDebugModalVisible(false);
      setDebugStatus(null);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView contentContainerStyle={{ padding: 24 }}>

        {/* ヘッダー */}
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Pressable onLongPress={handleReset} delayLongPress={1500}>
              <Text className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">{'>'} DASHBOARD_ (HOLD_TO_WIPE)</Text>
            </Pressable>
            <Text className="text-white text-2xl font-bold mt-1">{userName}さん、おかえりなさい。</Text>
          </View>
          <TouchableOpacity
            className="bg-gray-800 p-3 rounded-full"
            onPress={() => setDebugModalVisible(true)}
          >
            <Feather name="settings" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* ⚠️ Daily Diagnostic status */}
        {!hasAnsweredToday ? (
          <Pressable
            onPress={() => {
              resetQuestions();
              router.push('/question');
            }}
            className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 flex-row items-center"
          >
            <Feather name="alert-triangle" size={20} color="#ef4444" />
            <View className="ml-3 flex-1">
              <Text className="text-red-400 font-bold tracking-widest text-xs">⚠ DAILY_DIAGNOSTIC_REQUIRED</Text>
              <Text className="text-red-500/80 text-[10px] mt-1">未完了のタスクがあります。タップして実行してください。</Text>
            </View>
            <View className="bg-red-500/20 px-2 py-1 rounded">
              <Text className="text-red-500 text-[10px] font-bold">EXECUTE &gt;&gt;</Text>
            </View>
          </Pressable>
        ) : (
          <View className="bg-green-900/20 border border-green-500/50 p-4 rounded-xl mb-6 flex-row items-center">
            <Feather name="check-circle" size={20} color="#10B981" />
            <View className="ml-3 flex-1">
              <Text className="text-green-400 font-bold tracking-widest text-xs">✓ DAILY_SCAN_COMPLETE</Text>
              <Text className="text-green-500/80 text-[10px] mt-1">今日のスキャンは完了しています。明日また実行してください。</Text>
            </View>
          </View>
        )}

        {/* メインビジュアル：円形進捗 */}
        <View className="items-center justify-center my-6">
          <View className="w-56 h-56 rounded-full border-[10px] border-[#3B82F6] items-center justify-center bg-gray-900 shadow-2xl relative">
            <View className="absolute w-64 h-64 border border-[#3B82F6]/10 rounded-full" />
            <Text className="text-gray-500 text-[10px] tracking-widest mb-1 uppercase">Analysis</Text>
            <Text className="text-white text-4xl font-bold">Explore</Text>
            <Text className="text-[#3B82F6] text-xl font-bold mt-1">85%</Text>
          </View>
        </View>

        {/* AI解析エリア：プロフィール反映 */}
        <View className="bg-gray-800/80 p-5 rounded-2xl mb-8 border border-gray-700">
          <View className="flex-row items-center mb-3">
            <Feather name="cpu" size={16} color="#3B82F6" />
            <Text className="text-[#3B82F6] font-bold ml-2 text-[10px] tracking-widest uppercase">System Analysis</Text>
          </View>
          <Text className="text-gray-300 text-sm leading-6">
            日々の質問に答えることで、あなたの状態を可視化します。
          </Text>
        </View>

        {/* ミッションリスト： に合わせた内容 */}
        <View className="mb-10">
          <Text className="text-white text-lg font-bold mb-4 tracking-widest">	Recommended Tasks
          </Text>
          <HackerTaskCard title="深呼吸" tag="Core" time="45min" color="Core" />
          <HackerTaskCard title="プランク" tag="Deep" time="30min" color="Deep" />
          <HackerTaskCard title="コーディング" tag="Quick" time="15min" color="Quick" />
        </View>

      </ScrollView>

      {/* Debug Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={debugModalVisible}
        onRequestClose={() => setDebugModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable className="flex-1 bg-black/50" onPress={() => setDebugModalVisible(false)} />
          <View className="bg-gray-900 border-t border-gray-700 p-6 rounded-t-3xl">
            <Text className="text-white text-xl font-bold mb-6 text-center tracking-widest">DEBUG_MODE</Text>

            {debugStatus ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#3B82F6" className="mb-4" />
                <Text className="text-white font-bold">{debugStatus}</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleNextDayDebug}
                  className="bg-blue-600/20 border border-blue-500 p-4 rounded-xl mb-4 flex-row items-center justify-center"
                >
                  <Feather name="clock" size={20} color="#3B82F6" />
                  <Text className="text-blue-400 font-bold ml-2">⏩ NEXT DAY (RESET DAILY)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReset}
                  className="bg-red-600/20 border border-red-500 p-4 rounded-xl mb-6 flex-row items-center justify-center"
                >
                  <Feather name="trash-2" size={20} color="#ef4444" />
                  <Text className="text-red-400 font-bold ml-2">⚠ FULL RESET (WIPE DATA)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDebugModalVisible(false)}
                  className="p-4 items-center"
                >
                  <Text className="text-gray-500">CLOSE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}