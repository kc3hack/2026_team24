import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import StatusHeatmap from '../../components/history/StatusHeatmap';
import DayDetail from '../../components/history/DayDetail';
import MonthSelectorModal from '../../components/history/MonthSelectorModal';
import { generateYearData } from '../../data/mock/historyData';
import { HistoryLog } from '../../types';

export default function HistoryScreen() {
    // Default to the current month or the latest data month
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);

    // Memoize data generation to avoid re-generating on every render
    const historyData = useMemo(() => generateYearData(), []);

    const selectedDayLog = useMemo(() => {
        if (!selectedDate) return null;
        return historyData.find(log => log.date === selectedDate) || null;
    }, [selectedDate, historyData]);

    const handleDayPress = (day: HistoryLog) => {
        setSelectedDate(day.date);
    };

    // Calculate current streak
    const currentStreak = useMemo(() => {
        const sortedData = [...historyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let checkDate = new Date(today);

        // Check if today has an entry, if not, check yesterday to start streak
        // Simplified logic: strict consecutive days in data
        // Need to handle missing days in mock data -> break streak

        // Find if today exists
        const todayStr = today.toISOString().split('T')[0];
        const hasToday = sortedData.some(d => d.date === todayStr);

        // If today is missing, we check if yesterday exists, if so streak continues from yesterday
        // If today exists, streak includes today.

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
    }, [historyData]);

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

    // Check if the displayed month is the current real-world month
    const isCurrentMonth = useMemo(() => {
        const today = new Date();
        return currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    }, [currentMonth]);

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
                        disabled={isCurrentMonth}
                        className={`p-2 bg-slate-800 rounded-full ${isCurrentMonth ? 'opacity-30' : ''}`}
                    >
                        <Feather name="chevron-right" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Heatmap Section */}
                <View className="mb-8 min-h-[300px]">
                    <StatusHeatmap
                        data={historyData}
                        displayMonth={currentMonth}
                        onDayPress={handleDayPress}
                        selectedDate={selectedDate}
                    />
                </View>

                {/* Detail Section */}
                <DayDetail selectedDay={selectedDayLog} />

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
