import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabase/client';
import { getPreviousTitles, getTasksByDiagnosticId } from '../../supabase/tasks';
import { ParameterScores, DBTask } from '../../types';
import { useDataModeStore } from '../../store/dataModeStore';
import StarryBackground from '../../components/ui/StarryBackground';

const { width } = Dimensions.get('window');

const SPACE_BG = '#020617';
const RADAR_THEME = '#00E5FF';

// カテゴリごとの色マッピング
const CATEGORY_COLORS: Record<string, string> = {
  '探索系': '#FF00FF',
  '没頭系': '#39FF14',
  '整理系': '#8B5CF6',
  '貢献系': '#F97316',
  '元気系': '#06B6D4',
};

// 難易度マッピング
const LEVEL_LABELS: Record<string, string> = {
  'quick': 'QUICK',
  'core': 'CORE',
  'deep': 'DEEP',
};

type Mission = { cat: string; title: string; color: string; level?: string; };

// モックデータ（開発・デバッグ用）
const MOCK_MISSIONS: Mission[] = [
  { cat: '没頭', title: '焼肉を食う', color: '#39FF14', level: 'QUICK' },
  { cat: '元気', title: '高級焼肉を食う', color: '#22D3EE', level: 'CORE' },
  { cat: '探索', title: '高級焼肉を奢ってもらう', color: '#FF00FF', level: 'DEEP' }
];

// DBTaskをMission形式に変換
const convertTaskToMission = (task: DBTask): Mission => {
  const categoryLabel = task.category.replace('系', '');
  const color = CATEGORY_COLORS[task.category] || '#FFFFFF';
  const level = LEVEL_LABELS[task.level] || task.level.toUpperCase();

  return {
    cat: categoryLabel,
    title: task.title,
    color: color,
    level: level,
  };
};

// Tips配列（10個）
const TIPS = [
  "💡 小さなタスクから始めると、達成感が得られやすくなります",
  "🎯 1つのタスクに集中することで、効率が2倍になります",
  "⏰ タスクには必ず時間制限を設定しましょう",
  "🌟 完璧を目指さず、まず完了させることを優先しましょう",
  "🔄 25分集中→5分休憩のポモドーロテクニックがおすすめです",
  "📝 タスクを細分化すると、取り組みやすくなります",
  "🎉 小さな成功を祝うことで、モチベーションが続きます",
  "🧘 深呼吸をして、リラックスしてから始めましょう",
  "🚀 最も難しいタスクを朝一番に片付けると、1日が軽くなります",
  "💪 毎日少しずつ継続することが、大きな成果につながります",
];

export default function ResultFlowScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scores, setScores] = useState<ParameterScores | null>(null);
  const [profileId, setProfileId] = useState('');
  const [diagnosticId, setDiagnosticId] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Tips自動切り替え（loading中）
  useEffect(() => {
    if (loading) {
      setCurrentTipIndex(0);
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
      }, 3500); // 3.5秒ごとに切り替え
      return () => clearInterval(interval);
    }
  }, [loading]);

  const loadData = async () => {
    try {
      const [scoresStr, profId, diagId] = await AsyncStorage.multiGet([
        'current_scores',
        'profile_id',
        'current_diagnostic_id',
      ]);

      if (scoresStr[1]) {
        setScores(JSON.parse(scoresStr[1]));
      }
      setProfileId(profId[1] || '');
      setDiagnosticId(diagId[1] || '');
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  const handleSelectOption = async (option: string) => {
    console.log("Selected timing:", option);
    setSelectedOption(option);
    setLoading(true);

    try {
      const { dataMode } = useDataModeStore.getState();

      let generatedTasks: Mission[] = [];

      if (dataMode === 'mock') {
        // mockモード: モックデータを使用（3秒待機）
        console.log('[MOCK MODE] Using mock tasks instead of AI');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒待機
        generatedTasks = MOCK_MISSIONS;
      } else {
        // liveモード: 統合関数を呼び出し
        const [techStackStr, hobbiesStr, answersStr] = await AsyncStorage.multiGet([
          'techStack',
          'hobbies',
          'current_answers',
        ]);

        const techStack = techStackStr[1] ? JSON.parse(techStackStr[1]) : [];
        const hobbies = hobbiesStr[1] ? JSON.parse(hobbiesStr[1]) : [];
        const answers = answersStr[1] ? JSON.parse(answersStr[1]) : [];

        const previousTitles = await getPreviousTitles(profileId);

        const { data, error } = await supabase.functions.invoke('generate-tasks-and-advice', {
          body: {
            profile_id: profileId,
            diagnostic_id: diagnosticId,
            scores: scores || { exploration: 50, immersion: 50, organization: 50, contribution: 50, vitality: 50 },
            answers: answers,
            availability: option,
            profile: {
              job_title: techStack.length > 0 ? techStack : ['エンジニア'],
              hobbies: hobbies,
              interests: techStack,
            },
            previous_titles: previousTitles,
          },
        });

        if (error) {
          console.error('Task and advice generation error:', error);
          generatedTasks = MOCK_MISSIONS; // フォールバック
        } else if (data?.task_ids && data.task_ids.length > 0) {
          console.log('Tasks and advice generated:', data);

          try {
            const tasks = await getTasksByDiagnosticId(diagnosticId);
            const taskMissions = tasks.slice(0, 3).map(convertTaskToMission);
            generatedTasks = taskMissions;

            console.log('Tasks converted to missions:', taskMissions);

            // アドバイスを診断結果に保存
            if (data.advice) {
              console.log('Saving advice to diagnostic...');
              await supabase
                .from('diagnostics')
                .update({ advice: data.advice })
                .eq('id', diagnosticId);
            }
          } catch (e) {
            console.error('Failed to fetch tasks from DB:', e);
            generatedTasks = MOCK_MISSIONS;
          }
        } else {
          generatedTasks = MOCK_MISSIONS;
        }
      }

      // AsyncStorageに保存
      await AsyncStorage.setItem('generated_tasks', JSON.stringify(generatedTasks));

      // radar画面へ遷移（loading状態のまま遷移）
      router.push('/question/radar');

    } catch (e) {
      console.error('Failed to generate tasks:', e);
      // エラーでも遷移（モックデータを保存）
      await AsyncStorage.setItem('generated_tasks', JSON.stringify(MOCK_MISSIONS));
      router.push('/question/radar');
    }
    // 注意: finally ブロックでsetLoading(false)を呼ばない
    // 遷移するため、コンポーネントがアンマウントされるので不要
    // setLoading(false)を呼ぶと、遷移前に一瞬「いつやりますか？」が表示されてしまう
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <StarryBackground />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MISSION SETUP</Text>
        </View>

        <View style={styles.displayArea}>
          {loading ? (
            <View style={styles.loadingDisplayContainer}>
              <View style={styles.loadingIndicatorWrapper}>
                <ActivityIndicator size="large" color={RADAR_THEME} />
                <Text style={styles.loadingTitle}>GENERATING...</Text>
              </View>
              <View style={styles.tipContainer}>
                <Text style={styles.tipText}>{TIPS[currentTipIndex]}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>いつやりますか？</Text>
              <Text style={styles.questionSubtitle}>最適なタスクを提案します</Text>
            </View>
          )}
        </View>

        {!loading && (
          <View style={styles.footer}>
            <View style={styles.selectionContainer}>
              <TouchableOpacity onPress={() => handleSelectOption('morning')} style={styles.optionButtonLarge}>
                <Text style={styles.optionTextLarge}>朝にする</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSelectOption('daytime')} style={styles.optionButtonLarge}>
                <Text style={styles.optionTextLarge}>昼にする</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSelectOption('night')} style={styles.optionButtonLarge}>
                <Text style={styles.optionTextLarge}>夜にする</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SPACE_BG },
  contentWrapper: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: RADAR_THEME, fontSize: 14, fontWeight: '900', letterSpacing: 5 },
  displayArea: { flex: 1, width: width, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  questionContainer: { alignItems: 'center' },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  questionSubtitle: {
    color: RADAR_THEME,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: RADAR_THEME,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  loadingDisplayContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  loadingIndicatorWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingTitle: {
    color: RADAR_THEME,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 16,
    textShadowColor: RADAR_THEME,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  footer: { width: '100%', alignItems: 'center', paddingBottom: 40, paddingHorizontal: 20 },
  loadingContainer: { width: '100%', alignItems: 'center' },
  selectionContainer: { width: '100%', alignItems: 'center' },
  tipContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderColor: RADAR_THEME,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  tipText: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  optionButtonLarge: {
    width: '100%',
    paddingVertical: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: RADAR_THEME,
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTextLarge: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  actionButton: {
    width: width * 0.7,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  buttonText: {
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#000',
  },
});
