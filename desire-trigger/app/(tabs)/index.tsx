import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 🦾 メカ・ハッカー風タスクカードコンポーネント (変更なし)
const HackerTaskCard = ({ title, tag, time, color }: { title: string, tag: string, time: string, color: string }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const neonColor = 
    color === 'Quick' ? '#06B6D4' :
    color === 'Core' ? '#3B82F6' :
    '#8B5CF6';

  const handlePressIn = () => {
    if (isCompleted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(progress, {
      toValue: 1, duration: 800, useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) completeTask();
    });
  };

  const handlePressOut = () => {
    if (isCompleted) return;
    Animated.timing(progress, {
      toValue: 0, duration: 300, useNativeDriver: false,
    }).start();
  };

  const completeTask = () => {
    setIsCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const widthInterpolate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={`relative mb-3 overflow-hidden rounded-xl border ${isCompleted ? 'border-green-500/50 bg-green-900/20' : 'border-gray-700 bg-gray-900'}`}
    >
      <Animated.View 
        style={{ width: widthInterpolate, backgroundColor: isCompleted ? 'transparent' : neonColor, opacity: 0.2, position: 'absolute', height: '100%', left: 0 }} 
      />
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-6 h-6 mr-4 items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
             {isCompleted && <Feather name="check" size={16} color="black" />}
          </View>
          <View>
            <Text className={`font-bold text-base ${isCompleted ? 'text-green-400 line-through' : 'text-gray-200'}`}>{title}</Text>
            {!isCompleted && (
              <View className="flex-row items-center mt-1">
                <Text style={{ color: neonColor, fontSize: 10, fontWeight: 'bold', marginRight: 8 }}>[{tag}]</Text>
                <Text className="text-gray-500 text-xs">TIME: {time}</Text>
              </View>
            )}
          </View>
        </View>
        <View>
          {isCompleted ? (
            <Text className="text-green-500 font-bold text-xs tracking-widest">[DONE]</Text>
          ) : (
            <Feather name="chevron-right" size={20} color="#4b5563" />
          )}
        </View>
      </View>
    </Pressable>
  );
};

// 🟢 診断完了エフェクト付きボタン
const DiagnosisButton = ({ onPress }: { onPress: () => void }) => {
  const [isDone, setIsDone] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // デモ用：長押しで「診断完了して戻ってきた状態」を再現
  const handleLongPress = () => {
    if (!isDone) {
      setIsDone(true);
      // 成功の振動！
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // ポップアップするアニメーション
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();
    } else {
      // もう一度長押しでリセット（デモ用）
      setIsDone(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Pressable
      onPress={onPress} // 普通のタップは質問画面へ遷移
      onLongPress={handleLongPress} // 長押しでエフェクト発動
      className="flex-1"
    >
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className={`py-4 px-2 rounded-2xl items-center shadow-lg border ${
          isDone 
            ? 'bg-green-900/30 border-green-500' // 完了時：ハッカーっぽいダークグリーン
            : 'bg-[#3B82F6] border-[#3B82F6]'    // 未完了時：探索のブルー
        }`}
      >
        {isDone ? (
          <>
            <View className="flex-row items-center">
              <Feather name="check-circle" size={16} color="#4ade80" />
              <Text className="text-green-400 font-bold text-base ml-2">診断完了</Text>
            </View>
            <Text className="text-green-600 text-[10px] mt-1 font-bold tracking-widest">SYSTEM UPDATED</Text>
          </>
        ) : (
          <>
            <Text className="text-white font-bold text-base">📝 今日の診断</Text>
            <Text className="text-blue-200 text-xs mt-1 font-bold tracking-widest">未完了</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

// 🏠 ホーム画面本体
export default function HomeScreen() {
  const router = useRouter();
  const userName = "Koki";

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        {/* ヘッダーエリア */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-gray-400 text-xs font-bold mb-1 tracking-widest">DASHBOARD</Text>
            <Text className="text-white text-2xl font-bold">{userName}さん、お疲れ様です。</Text>
          </View>
          <TouchableOpacity className="bg-gray-800 p-3 rounded-full">
            <Feather name="settings" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* アクションボタン（診断＆日記） */}
        <View className="flex-row gap-4 mb-10">
          
          {/* ★ 新しく作ったエフェクト付きボタンに差し替え！ */}
          <DiagnosisButton onPress={() => router.push('/question')} />
          
          <TouchableOpacity className="flex-1 bg-gray-800 py-4 px-2 rounded-2xl items-center border border-gray-700">
            <Text className="text-gray-300 font-bold text-base">📓 今日の日記</Text>
            <Text className="text-gray-500 text-[10px] mt-1 font-bold tracking-widest">OPTIONAL</Text>
          </TouchableOpacity>
        </View>

        {/* メインビジュアル（コア・オブジェクト） */}
        <View className="items-center justify-center my-6">
          <View className="w-56 h-56 rounded-full border-8 border-[#3B82F6] items-center justify-center bg-gray-900 shadow-2xl relative">
            <Text className="text-gray-400 text-xs tracking-widest mb-2">CURRENT MODE</Text>
            <Text className="text-white text-4xl font-bold">Explore</Text>
            <Text className="text-[#3B82F6] text-lg font-bold mt-1">85%</Text>
          </View>
        </View>

        {/* AIアナリティクス（ステータスメッセージ） */}
        <View className="bg-gray-800/80 p-5 rounded-2xl mb-10 border border-gray-700">
          <View className="flex-row items-center mb-2">
            <Feather name="cpu" size={16} color="#3B82F6" />
            <Text className="text-[#3B82F6] font-bold ml-2">System Analysis</Text>
          </View>
          <Text className="text-gray-300 text-base leading-relaxed">
            探索意欲は高いですが、休息が不足気味です。インプットより
            <Text className="text-[#06B6D4] font-bold"> 回復 (Idle) </Text>
            を優先してください。
          </Text>
        </View>

        {/* 今日のタスク（Hacker Mode） */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4 tracking-wider">
            MISSION LIST <Text className="text-gray-600 text-xs font-normal"> // Long press to commit</Text>
          </Text>
          
          <HackerTaskCard title="深呼吸 (System Reboot)" tag="Quick" time="1min" color="Quick" />
          <HackerTaskCard title="技術記事を読む (Data Input)" tag="Core" time="15min" color="Core" />
          <HackerTaskCard title="難読化コード解読 (Decrypt)" tag="Deep" time="60min" color="Deep" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}