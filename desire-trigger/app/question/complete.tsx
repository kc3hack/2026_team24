import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { calculateParameters } from '../../lib/calcParameters';
import { saveDiagnosticResult, markDiagnosticAnswered } from '../../supabase/diagnostics';
import { supabase } from '../../supabase/client';
import { DBQuestion, QuestionAnswer } from '../../types';
import { addAnsweredQuestionId } from '../../lib/answeredQuestions';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function QuestionCompleteScreen() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('データを処理中...');

  // 🚀 逆ホワイトアウト（白から元の画面へ）
  const fadeOutOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. 画面表示と同時に白から背景（黒）へフェードアウト
    fadeOutOpacity.value = withTiming(0, { duration: 1200 });

    // 2. パラメータ計算とアドバイス生成
    processResults();
  }, []);

  const processResults = async () => {
    try {
      // AsyncStorageから取得
      const [questionsStr, answersStr, diagnosticIdStr] = await AsyncStorage.multiGet([
        'current_questions',
        'current_answers',
        'current_diagnostic_id',
      ]);

      const questions: DBQuestion[] = questionsStr[1] ? JSON.parse(questionsStr[1]) : [];
      const answers: QuestionAnswer[] = answersStr[1] ? JSON.parse(answersStr[1]) : [];
      const diagnosticId = diagnosticIdStr[1] || '';

      if (!diagnosticId || questions.length === 0 || answers.length === 0) {
        throw new Error('診断データが見つかりません');
      }

      // 🎯 パラメータ表示前に「回答済み」フラグを立てる
      // これにより、ホーム画面が即座に「今日は回答済み」と認識できる
      // （ただし、まだパラメータやアドバイスは保存されていない状態）
      setStatusText('回答を保存中...');

      // 1. 診断レコードにanswersを保存（パラメータ計算前）
      await markDiagnosticAnswered(diagnosticId, answers);

      // 2. 回答済み質問IDをAsyncStorageに追加
      const profileId = await AsyncStorage.getItem('profile_id');
      if (profileId) {
        for (const answer of answers) {
          const questionId = parseInt(answer.question_id, 10);
          await addAnsweredQuestionId(profileId, questionId);
        }
      }

      // パラメータ計算
      setStatusText('パラメータを計算中...');
      const scores = calculateParameters(answers, questions);

      // answersWithText を準備（result-flowで使用）
      const answersWithText = answers.map(a => {
        // 🔧 型変換対応：question_id が文字列でも数値でも対応
        const questionIdNumber = typeof a.question_id === 'string'
          ? parseInt(a.question_id, 10)
          : a.question_id;
        const q = questions.find(qu => qu.id === questionIdNumber);
        return {
          ...a,
          question_text: q?.text || '',
        };
      });

      // 診断結果を保存（アドバイスはresult-flowで生成・保存される）
      setStatusText('結果を保存中...');
      await saveDiagnosticResult(diagnosticId, {
        answers,
        scores,
        advice: null, // アドバイスはresult-flowで生成される
      });

      // AsyncStorageに scores と answers を保存（result-flowで使用）
      await AsyncStorage.setItem('current_scores', JSON.stringify(scores));
      await AsyncStorage.setItem('current_answers', JSON.stringify(answersWithText));

      // 遷移
      setTimeout(() => {
        router.replace('/question/result-flow');
      }, 500);

    } catch (e) {
      console.error('Process results error:', e);
      setStatusText('エラーが発生しました');
      // エラーでも遷移する（モックデータで表示）
      setTimeout(() => {
        router.replace('/question/result-flow');
      }, 1500);
    }
  };

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
          {statusText}
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