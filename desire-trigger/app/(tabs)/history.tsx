import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusHeatmap from '../../components/history/StatusHeatmap';
import DayDetail from '../../components/history/DayDetail';
import MonthSelectorModal from '../../components/history/MonthSelectorModal';
import { HistoryLog, Diagnostic, DayDetail as DayDetailType } from '../../types';
import { getMonthlyDiagnostics, getAvailableMonths, getDayDetail, getAllDiagnostics } from '../../supabase/diagnostics';
import { MetricKey } from '../../types';
import { calcStreak } from '../../lib/calcStreak';
import { useDataModeStore } from '../../store/dataModeStore';
import { SpaceBackground } from '../../components/ui/SpaceBackground';

// パラメータ名のマッピング（MetricKey → 日本語）
const metricToJapanese: Record<MetricKey, string> = {
    exploration: '探索',
    immersion: '没頭',
    organization: '整理',
    contribution: '貢献',
    vitality: '元気',
};

// DiagnosticをHistoryLogに変換（最高パラメータの色を決定）
const diagnosticToHistoryLog = (diagnostic: Diagnostic): HistoryLog => {
    // 最高値のパラメータを使用（diagnostic.dominant_metricには既に最高値が格納されている）
    const dominantMetricKey: MetricKey = diagnostic.dominant_metric;

    return {
        date: diagnostic.date,
        hasQuestions: true,
        hasTasks: true,
        dominantMetric: metricToJapanese[dominantMetricKey],
        score: Math.round(Math.max(
            diagnostic.exploration,
            diagnostic.immersion,
            diagnostic.organization,
            diagnostic.contribution,
            diagnostic.vitality
        )),
    };
};

export default function HistoryScreen() {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
    const [historyData, setHistoryData] = useState<HistoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [selectedDayDetail, setSelectedDayDetail] = useState<DayDetailType | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [allDiagnostics, setAllDiagnostics] = useState<Diagnostic[]>([]);

    const { dataMode } = useDataModeStore();

    useFocusEffect(
        useCallback(() => {
            loadAvailableMonths();
            loadMonthData();
            loadAllDiagnostics(); // ストリーク計算用
        }, [currentMonth])
    );

    const loadAvailableMonths = async () => {
        try {
            // MOCKモードの場合はモックデータから利用可能な月を生成
            if (dataMode === 'mock') {
                const { generateMockDiagnostics } = await import('../../constants/mockData');
                const mockDiagnostics = generateMockDiagnostics();
                const months = [...new Set(mockDiagnostics.map(d => d.date.substring(0, 7)))];
                setAvailableMonths(months);
                return;
            }

            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            const months = await getAvailableMonths(profileId);
            setAvailableMonths(months);
        } catch (e) {
            console.error('Failed to load available months:', e);
        }
    };

    const loadMonthData = async () => {
        try {
            setLoading(true);

            // MOCKモードの場合はモックデータを使用
            if (dataMode === 'mock') {
                const { generateMockDiagnostics } = await import('../../constants/mockData');
                const mockDiagnostics = generateMockDiagnostics();

                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1;

                // 現在の月のデータのみフィルター
                const monthDiagnostics = mockDiagnostics.filter(d => {
                    const [y, m] = d.date.split('-').map(Number);
                    return y === year && m === month;
                });

                const logs = monthDiagnostics.map(diagnostic => diagnosticToHistoryLog(diagnostic));
                setHistoryData(logs);
                setLoading(false);
                return;
            }

            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;

            const diagnostics = await getMonthlyDiagnostics(profileId, year, month);

            // 各診断を履歴ログに変換
            const logs = diagnostics.map(diagnostic => diagnosticToHistoryLog(diagnostic));

            setHistoryData(logs);
        } catch (e) {
            console.error('Failed to load month data:', e);
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAllDiagnostics = async () => {
        try {
            // MOCKモードの場合はモックデータを使用
            if (dataMode === 'mock') {
                const { generateMockDiagnostics } = await import('../../constants/mockData');
                const mockDiagnostics = generateMockDiagnostics();
                setAllDiagnostics(mockDiagnostics);
                return;
            }

            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            // 全診断データを取得（ストリーク計算用）
            const diagnostics = await getAllDiagnostics(profileId);
            setAllDiagnostics(diagnostics);
        } catch (e) {
            console.error('Failed to load all diagnostics:', e);
            setAllDiagnostics([]);
        }
    };

    const handleDayPress = async (day: HistoryLog) => {
        setSelectedDate(day.date);
        setDetailLoading(true);
        setSelectedDayDetail(null);

        try {
            // MOCKモードの場合はモックデータを使用
            if (dataMode === 'mock') {
                const { generateMockDayDetail } = await import('../../constants/mockData');
                const mockDetail = generateMockDayDetail(day.date);
                setSelectedDayDetail(mockDetail);
                setDetailLoading(false);
                return;
            }

            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            // 実際のタスクデータを取得
            const detail = await getDayDetail(profileId, day.date);
            setSelectedDayDetail(detail);
        } catch (e) {
            console.error('Failed to load day detail:', e);
        } finally {
            setDetailLoading(false);
        }
    };

    // Calculate current streak using calcStreak
    const currentStreak = useMemo(() => {
        return calcStreak(allDiagnostics);
    }, [allDiagnostics]);

    // 月がアクセス可能かチェック（liveモード時のみ）
    const isMonthAccessible = (year: number, month: number): boolean => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 現在の月は常にアクセス可能
        if (year === currentYear && month === currentMonth) return true;

        // モックモードでは全月アクセス可
        if (dataMode === 'mock') return true;

        // その月に回答データが存在するか確認（availableMonthsを利用）
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        return availableMonths.includes(monthKey);
    };

    const handlePrevMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;

        // 月がアクセス可能な場合のみ移動
        if (isMonthAccessible(year, month)) {
            setCurrentMonth(newDate);
            setSelectedDate(null); // 選択をリセット
        }
    };

    const handleNextMonth = () => {
        const now = new Date();
        const nowYear = now.getFullYear();
        const nowMonth = now.getMonth() + 1;

        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;

        // 現在の月より先には進めない
        if (year > nowYear || (year === nowYear && month > nowMonth)) {
            return;
        }

        // 月がアクセス可能な場合のみ移動
        if (isMonthAccessible(year, month)) {
            setCurrentMonth(newDate);
            setSelectedDate(null); // 選択をリセット
        }
    };

    // Japanese format: YYYY年 M月
    const monthLabel = `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`;

    // 前月・次月ボタンの有効/無効を判定
    const canGoPrev = (() => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        return isMonthAccessible(prevMonth.getFullYear(), prevMonth.getMonth() + 1);
    })();

    const canGoNext = (() => {
        const now = new Date();
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const year = nextMonth.getFullYear();
        const month = nextMonth.getMonth() + 1;

        // 現在の月より先には進めない
        if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)) {
            return false;
        }

        return isMonthAccessible(year, month);
    })();

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea}>
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
                        disabled={!canGoPrev}
                        className="p-2 bg-slate-800 rounded-full"
                        style={{ opacity: canGoPrev ? 1 : 0.3 }}
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
                        disabled={!canGoNext}
                        className="p-2 bg-slate-800 rounded-full"
                        style={{ opacity: canGoNext ? 1 : 0.3 }}
                    >
                        <Feather name="chevron-right" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Heatmap Section */}
                <View className="mb-8 min-h-[300px]">
                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : (
                        <StatusHeatmap
                            data={historyData}
                            displayMonth={currentMonth}
                            onDayPress={handleDayPress}
                            selectedDate={selectedDate}
                        />
                    )}
                </View>

                {/* Detail Section */}
                {!loading && <DayDetail selectedDayDetail={selectedDayDetail} loading={detailLoading} />}

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
                availableMonths={availableMonths}
            />
        </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510', // 宇宙背景に合わせた背景色
    },
    safeArea: {
        flex: 1,
    },
});
