import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHomeData } from '../../supabase/home';
import { getSessionDate } from '../../lib/dateUtils';
import { getRandomQuestions } from '../../supabase/questions';
import { createDiagnostic } from '../../supabase/diagnostics';
import { HomeData } from '../../types';
import { useDataModeStore } from '../../store/dataModeStore';

// Components
import GreetingHeader from '../../components/home/GreetingHeader';
import SystemAnalysisCard from '../../components/home/SystemAnalysisCard';
import LaunchButton from '../../components/home/LaunchButton';
import AnalysisSummaryCard from '../../components/home/AnalysisSummaryCard';
import ActionSummaryCard from '../../components/home/ActionSummaryCard';
import StarryBackground from '../../components/ui/StarryBackground';

export default function HomeScreen() {
  const router = useRouter();
  const { dataMode } = useDataModeStore();

  // State
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tooltip State
  const [showTooltip, setShowTooltip] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. profile_idを取得
      const profileId = await AsyncStorage.getItem('profile_id');
      if (!profileId) {
        throw new Error('プロフィールが見つかりません');
      }

      // 2. セッション日付を取得
      const sessionDate = await getSessionDate();

      // 3. ホームデータを取得
      const data = await getHomeData(profileId, sessionDate);
      setHomeData(data);

      // 4. 今日まだ回答していない場合：質問を取得して準備
      if (!data.todayAnswered) {
        // 既に質問が準備済みかチェック
        const existingQuestions = await AsyncStorage.getItem('current_questions');
        const existingDiagnosticId = await AsyncStorage.getItem('current_diagnostic_id');

        if (!existingQuestions || !existingDiagnosticId) {
          // 診断レコードを作成
          const diagnosticId = await createDiagnostic(profileId, sessionDate);

          // ランダム質問を取得
          const questions = await getRandomQuestions(profileId);

          // AsyncStorageに保存（質問開始時に使用）
          await AsyncStorage.multiSet([
            ['current_diagnostic_id', diagnosticId],
            ['current_questions', JSON.stringify(questions)],
            ['current_answers', JSON.stringify([])],
            ['current_question_index', '0'],
          ]);

          console.log('Questions prepared for today:', questions.length);
        }
      }

      // 5. Tooltip Check
      const hasSeen = await AsyncStorage.getItem('hasSeenTooltip');
      if (hasSeen !== 'true') {
        setShowTooltip(true);
        setTimeout(async () => {
          setShowTooltip(false);
          await AsyncStorage.setItem('hasSeenTooltip', 'true');
        }, 3000);
      }

    } catch (e) {
      console.error('Failed to load home data:', e);
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = () => {
    router.push('/question');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617' }}>
        <View style={StyleSheet.absoluteFill}>
          <StarryBackground />
        </View>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <View style={StyleSheet.absoluteFill}>
        <StarryBackground />
      </View>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>

        {/* Header */}
        <GreetingHeader
          userName={homeData?.userName || "..."}
        />

        {/* Error Display */}
        {error && (
          <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <Text className="text-red-400 text-center">{error}</Text>
          </View>
        )}

        {/* Launch Button */}
        <View className="mb-8 mt-4">
          <LaunchButton
            isDiagnosed={homeData?.todayAnswered || false}
            onPress={handleLaunch}
            showTooltip={showTooltip}
          />
        </View>

        {/* Summaries (Mock mode: 常に表示, Live mode: 回答済みの場合のみ) */}
        {(dataMode === 'mock' || homeData?.todayAnswered) && homeData && (
          <>
            {homeData.topParameter && (
              <AnalysisSummaryCard
                dominantMetric={homeData.topParameter.name}
                dominantMetricKey={homeData.topParameter.key}
                value={homeData.topParameter.score}
                showTooltip={showTooltip}
              />
            )}

            <ActionSummaryCard
              totalTasks={homeData.taskSummary.total}
              completedTasks={homeData.taskSummary.completed}
              isAllCompleted={homeData.taskSummary.completed === homeData.taskSummary.total && homeData.taskSummary.total > 0}
              showTooltip={showTooltip}
            />
          </>
        )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}