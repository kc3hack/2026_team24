import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay 
} from 'react-native-reanimated';

export default function QuestionCompleteScreen() {
  const router = useRouter();
  
  // 🚀 逆ホワイトアウト（白から元の画面へ）
  const fadeOutOpacity = useSharedValue(1); 

  useEffect(() => {
    // 1. 画面表示と同時に白から背景（黒）へフェードアウト
    fadeOutOpacity.value = withTiming(0, { duration: 1200 });

    // 2. 2.5秒後に【分析画面】へ直接遷移
    const timer = setTimeout(() => {
      // 🚀 ここを修正：/(tabs) ではなく /(tabs)/chart に変更
      // あなたのディレクトリ構成に合わせて /chart か /(tabs)/chart にしてください
      router.replace('/(tabs)/chart'); 
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: fadeOutOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View className="items-center">
        {/* 成功インジケータ */}
        <View className="bg-green-500/10 w-24 h-24 rounded-full items-center justify-center mb-8 border border-green-500/20">
          <Feather name="check" size={48} color="#39FF14" />
        </View>

        <Text className="text-gray-500 text-[10px] tracking-[0.4em] uppercase mb-2">Sync Sequence</Text>
        <Text className="text-white text-3xl font-bold mb-4 text-center">同期完了</Text>
        
        <Text className="text-gray-500 text-center mb-10 text-sm leading-relaxed px-10">
          ニューラルデータの解析が終了しました。{"\n"}分析プロセッサを起動します。
        </Text>

        <ActivityIndicator size="small" color="#3B82F6" />
      </View>

      {/* 🚀 前の画面のホワイトアウトを引き継ぐレイヤー */}
      <Animated.View 
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF' }, overlayStyle]} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', // 帰還先の背景色
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});