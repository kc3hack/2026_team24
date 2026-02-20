import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomQuestions } from '../../supabase/questions';
import { createDiagnostic } from '../../supabase/diagnostics';
import { getSessionDate } from '../../lib/dateUtils';
import { DBQuestion } from '../../types';

export default function QuestionStartScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. profile_idを取得
      const profileId = await AsyncStorage.getItem('profile_id');
      if (!profileId) {
        throw new Error('プロフィールが見つかりません');
      }

      // 2. 既に質問が準備済みかチェック
      const existingQuestions = await AsyncStorage.getItem('current_questions');
      const existingDiagnosticId = await AsyncStorage.getItem('current_diagnostic_id');

      // 3. 準備されていない場合のみ新規作成
      if (!existingQuestions || !existingDiagnosticId) {
        // セッション日付を取得
        const sessionDate = await getSessionDate();

        // 診断レコードを作成
        const diagnosticId = await createDiagnostic(profileId, sessionDate);

        // ランダム質問を取得（重複除外）
        const questions = await getRandomQuestions(profileId);

        // AsyncStorageに保存
        await AsyncStorage.multiSet([
          ['current_diagnostic_id', diagnosticId],
          ['current_questions', JSON.stringify(questions)],
          ['current_answers', JSON.stringify([])],
          ['current_question_index', '0'],
        ]);
      }

      // 4. 回答画面へ
      router.push('/question/answer');

    } catch (e) {
      console.error('Question start error:', e);
      setError(e instanceof Error ? e.message : '質問の読み込みに失敗しました');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212] items-center justify-center p-6">
      <View className="items-center mb-16">
        <View className="bg-blue-500/10 w-24 h-24 rounded-full items-center justify-center mb-8 border border-blue-500/20">
          <Feather name="cpu" size={40} color="#3B82F6" />
        </View>
        <Text className="text-gray-500 text-[10px] tracking-[0.3em] uppercase mb-2">Daily Protocol</Text>
        <Text className="text-white text-3xl font-bold mb-4 text-center">状態スキャン</Text>
        <Text className="text-gray-400 text-center leading-relaxed text-sm px-6">
          現在のニューラル状態を同期するために、いくつかの質問に回答してください。
        </Text>
      </View>

      {error && (
        <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <Text className="text-red-400 text-center">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-[#3B82F6] w-full py-5 rounded-2xl items-center shadow-lg active:opacity-90 mb-6"
        onPress={handleStart}
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white text-lg font-bold tracking-widest">スキャン開始</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
        <Text className="text-gray-600 font-bold tracking-widest text-[10px]">ABORT_SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}