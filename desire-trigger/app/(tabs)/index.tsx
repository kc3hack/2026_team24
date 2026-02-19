import React, { useState, useCallback } from 'react';
import { View, ScrollView, Modal, Pressable, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useMockStore } from '../../store/mockStore';

// Components
import GreetingHeader from '../../components/home/GreetingHeader';
import SystemAnalysisCard from '../../components/home/SystemAnalysisCard';
import LaunchButton from '../../components/home/LaunchButton';
import AnalysisSummaryCard from '../../components/home/AnalysisSummaryCard';
import ActionSummaryCard from '../../components/home/ActionSummaryCard';
import { getTodayDiagnostic, getLatestDiagnostic } from '../../supabase/diagnostics';
import { fetchTodayTasks } from '../../supabase/tasks';
import { mapMetricKeyToPrimary } from '../../lib/typeMapping';
import { PrimaryMetric } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { resetQuestions } = useMockStore();

  // State
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("...");
  const [hasDiagnosedEver, setHasDiagnosedEver] = useState(false);
  const [hasDiagnosedToday, setHasDiagnosedToday] = useState(false);

  // Data State
  const [taskSummary, setTaskSummary] = useState({ total: 0, completed: 0, isAllCompleted: false });
  const [analysisSummary, setAnalysisSummary] = useState<{ dominantMetric: string; value: number } | null>(null);

  // Tooltip State
  const [showTooltip, setShowTooltip] = useState(false);

  // Debug State
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [debugStatus, setDebugStatus] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Get Profile ID
      const profileId = await AsyncStorage.getItem('profile_id');
      const userName = await AsyncStorage.getItem('userName');
      if (userName) setUserName(userName);

      if (!profileId) {
        // Handle no profile (new user or reset) -> Should be handled by layout/guard usually
        setHasDiagnosedToday(false);
        setHasDiagnosedEver(false);
        return;
      }

      // 2. Diagnosis Status
      const todayDiag = await getTodayDiagnostic(profileId);
      setHasDiagnosedToday(!!todayDiag);

      // Check "Ever" (using AsyncStorage for simplicity or check DB count if needed)
      // For now, trust the existence of profile_id or check local flag
      const everDiagnosed = await AsyncStorage.getItem('hasLaunched');
      setHasDiagnosedEver(!!everDiagnosed);

      // 3. Tasks Status (Supabase)
      const tasks = await fetchTodayTasks(profileId);
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'applied' || t.isCompleted).length;
      const isAllCompleted = total > 0 && completed === total;

      setTaskSummary({ total, completed, isAllCompleted });

      // 4. Analysis Summary (Latest Diagnostic)
      if (todayDiag) {
        // If diagnosed today, use that
        const metricKey = todayDiag.dominant_metric;
        const primary = mapMetricKeyToPrimary(metricKey);
        // Value? Diagnostic struct has explicit fields.
        // We need to access the property dynamically or map it.
        // todayDiag is { exploration: 10, ... }
        // TS might complain about dynamic access.
        const val = (todayDiag as any)[metricKey] || 0;
        setAnalysisSummary({ dominantMetric: primary.toUpperCase(), value: val });
      } else {
        const latest = await getLatestDiagnostic(profileId);
        if (latest) {
          const metricKey = latest.dominant_metric;
          const primary = mapMetricKeyToPrimary(metricKey);
          const val = (latest as any)[metricKey] || 0;
          setAnalysisSummary({ dominantMetric: primary.toUpperCase(), value: val });
        }
      }

      // 5. Tooltip Check
      const hasSeen = await AsyncStorage.getItem('hasSeenTooltip');
      if (hasSeen !== 'true') {
        setShowTooltip(true);
        // Hide after 3 seconds
        setTimeout(async () => {
          setShowTooltip(false);
          await AsyncStorage.setItem('hasSeenTooltip', 'true');
        }, 3000);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const handleLaunch = () => {
    resetQuestions();
    router.push('/question');
  };

  // --- Debug Functions ---
  const handleReset = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setDebugStatus("タイトル画面へ戻ります...");
    setTimeout(async () => {
      const keys = ['hasLaunched', 'userName', 'ageGroup', 'lifestyle', 'interest', 'jobType', 'techStack', 'currentMode', 'notifTime', 'weekdayFreeTime', 'weekendFreeTime', 'lastQuestionDate', 'dailyMissionCompleted', 'hasDiagnosedEver', 'hasSeenTooltip'];
      await AsyncStorage.multiRemove(keys);
      resetQuestions();
      router.replace('/welcome');
    }, 2000);
  };

  const handleNextDayDebug = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDebugStatus("次の日に移行します...");
    setTimeout(async () => {
      await AsyncStorage.setItem('dailyMissionCompleted', 'false');
      // Remove today's date to simulate next day (undiagnosed)
      await AsyncStorage.removeItem('lastQuestionDate');
      setHasDiagnosedToday(false);
      setDebugModalVisible(false);
      setDebugStatus(null);
      loadData(); // Reload to refresh UI
    }, 1000);
  };

  const handleTasksCompleteDebug = async () => {
    // await AsyncStorage.setItem('dailyMissionCompleted', 'true');
    // setAllTasksCompleted(true);
    // For debug with Supabase, we might need a different approach or just mock the state locally
    setTaskSummary({ total: 3, completed: 3, isAllCompleted: true });
    setDebugModalVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#121212] justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView contentContainerStyle={{ padding: 24 }}>

        {/* Header */}
        <GreetingHeader
          userName={userName}
          onSettingsPress={() => setDebugModalVisible(true)}
          onLongPress={handleReset}
        />

        {/* Launch Button */}
        <View className="mb-8 mt-4">
          <LaunchButton
            isDiagnosed={hasDiagnosedToday}
            onPress={handleLaunch}
            showTooltip={showTooltip}
          />
        </View>

        {/* Summaries (Only if diagnosed) */}
        {hasDiagnosedToday && (
          <>
            {analysisSummary && (
              <AnalysisSummaryCard
                dominantMetric={analysisSummary.dominantMetric}
                value={analysisSummary.value}
                showTooltip={showTooltip}
              />
            )}

            <ActionSummaryCard
              totalTasks={taskSummary.total}
              completedTasks={taskSummary.completed}
              isAllCompleted={taskSummary.isAllCompleted}
              showTooltip={showTooltip}
            />
          </>
        )}

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
                  onPress={handleTasksCompleteDebug}
                  className="bg-green-600/20 border border-green-500 p-4 rounded-xl mb-4 flex-row items-center justify-center"
                >
                  <Feather name="check" size={20} color="#22c55e" />
                  <Text className="text-green-400 font-bold ml-2">✅ COMPLETE TASKS</Text>
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