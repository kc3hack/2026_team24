import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <Animated.View style={{ width: progress.interpolate({inputRange:[0,1], outputRange:['0%','100%']}), backgroundColor: isCompleted ? 'transparent' : neonColor, opacity: 0.4, position: 'absolute', height: '100%' }} />
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
        } catch (e) { console.error(e); }
      };
      load();
    }, [])
  );

  // 💥 システムリセット
  const handleReset = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const keys = ['hasLaunched', 'userName', 'ageGroup', 'lifestyle', 'interest', 'jobType', 'techStack', 'currentMode', 'notifTime', 'weekdayFreeTime', 'weekendFreeTime'];
    await AsyncStorage.multiRemove(keys);
    router.replace('/');
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
          <TouchableOpacity className="bg-gray-800 p-3 rounded-full">
            <Feather name="settings" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

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
    </SafeAreaView>
  );
}