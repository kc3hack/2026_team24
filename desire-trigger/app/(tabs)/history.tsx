import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusHeatmap from '../../components/history/StatusHeatmap';
import DayDetail from '../../components/history/DayDetail';
import MonthSelectorModal from '../../components/history/MonthSelectorModal';
import { HistoryLog, PrimaryMetric } from '../../types';
import { getDiagnosticHistory } from '../../supabase/diagnostics';
import { fetchTasksByDate } from '../../supabase/tasks';
import { mapMetricKeyToPrimary, mapMetricsToFrontend } from '../../lib/typeMapping';

export default function HistoryScreen() {
    // Default to the current month or the latest data month
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);

    // Data State
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            const diagnostics = await getDiagnosticHistory(profileId);

            const logs: HistoryLog[] = diagnostics.map(d => {
                const metrics = {
                    exploration: d.exploration,
                    immersion: d.immersion,
                    organization: d.organization,
                    contribution: d.contribution,
                    vitality: d.vitality,
                };
                // Calculate average score
                const sum = Object.values(metrics).reduce((a, b) => a + b, 0);
                const score = Math.round(sum / 5);

                return {
                    date: d.date,
                    primaryMetric: mapMetricKeyToPrimary(d.dominant_metric),
                    score: score,
                    metrics: mapMetricsToFrontend(metrics),
                    tasksCompleted: 0, // Placeholder, fetched on detail view if needed? Or we need another query?
                    taskList: []
                };
            });
            setHistoryLogs(logs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const selectedDayLog = useMemo(() => {
        if (!selectedDate) return null;
        return historyLogs.find(log => log.date === selectedDate) || null;
    }, [selectedDate, historyLogs]);

    const handleDayPress = async (day: HistoryLog) => {
        setSelectedDate(day.date);

        // Fetch tasks if not already loaded
        if (day.taskList && day.taskList.length > 0) return;

        try {
            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            const tasks = await fetchTasksByDate(profileId, day.date);

            // Update historyLogs with fetched tasks
            setHistoryLogs(prev => prev.map(log => {
                if (log.date === day.date) {
                    return { ...log, taskList: tasks, tasksCompleted: tasks.length };
                }
                return log;
            }));
        } catch (e) {
            console.error(e);
        }
    };

    // Calculate current streak
    const currentStreak = useMemo(() => {
        if (historyLogs.length === 0) return 0;

        const sortedData = [...historyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;

        // Find if today exists
        const todayStr = today.toISOString().split('T')[0];
        const hasToday = sortedData.some(d => d.date === todayStr);

        let currentDatePointer = new Date(today);
        if (!hasToday) {
            currentDatePointer.setDate(currentDatePointer.getDate() - 1);
        }

        while (true) {
            const dateStr = currentDatePointer.toISOString().split('T')[0];
            const hasLog = sortedData.some(d => d.date === dateStr);

            if (hasLog) {
                streak++;
                currentDatePointer.setDate(currentDatePointer.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [historyLogs]);

    const handlePrevMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
    };

    // Japanese format: YYYY年 M月
    const monthLabel = `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`;

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Header with Streak */}
                <View className="mb-8 flex-row justify-between items-end">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold mb-1 tracking-widest">
                            ACTIVITY LOG
                        </Text>
                        <Text className="text-white text-3xl font-bold">履歴</Text>
                    </View>
                    <View className="bg-orange-900/40 px-3 py-1 rounded-full border border-orange-500/30 flex-row items-center">
                        <Feather name="zap" size={14} color="#fb923c" />
                        <Text className="text-orange-400 font-bold ml-1 text-sm">{currentStreak}日継続中</Text>
                    </View>
                </View>

                {/* Month Selector Control */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={handlePrevMonth}
                        className="p-2 bg-slate-800 rounded-full"
                    >
                        <Feather name="chevron-left" size={24} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsMonthModalVisible(true)}
                        className="flex-row items-center justify-center px-4 py-2"
                    >
                        <Text className="text-white text-xl font-bold mr-2">{monthLabel}</Text>
                        <Feather name="chevron-down" size={20} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNextMonth}
                        className="p-2 bg-slate-800 rounded-full"
                    >
                        <Feather name="chevron-right" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Heatmap Section */}
                <View className="mb-8 min-h-[300px]">
                    <StatusHeatmap
                        data={historyLogs}
                        displayMonth={currentMonth}
                        onDayPress={handleDayPress}
                        selectedDate={selectedDate}
                    />
                </View>

                {/* Detail Section */}
                <DayDetail selectedDay={selectedDayLog} />

                {/* Motivation Section */}


            </ScrollView>

            {/* Modal */}
            <MonthSelectorModal
                visible={isMonthModalVisible}
                onClose={() => setIsMonthModalVisible(false)}
                onSelectMonth={(date) => {
                    setCurrentMonth(date);
                    // Optionally clear selected date when switching months
                    // setSelectedDate(null); 
                }}
                currentDate={currentMonth}
            />
        </SafeAreaView>
    );
}
