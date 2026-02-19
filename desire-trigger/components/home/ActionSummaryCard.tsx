import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Props = {
    totalTasks: number;
    completedTasks: number;
    isAllCompleted: boolean;
    showTooltip?: boolean;
};

export default function ActionSummaryCard({ totalTasks, completedTasks, isAllCompleted, showTooltip }: Props) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("0時間0分");
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${h}時間${m}分`);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Create a simple minute ticker
        return () => clearInterval(interval);
    }, []);

    const borderColor = isAllCompleted ? 'border-green-500/50' : 'border-gray-800';
    const textColor = isAllCompleted ? 'text-green-500' : 'text-white';
    const subTextColor = isAllCompleted ? 'text-green-500/60' : 'text-gray-400';
    const countColor = isAllCompleted ? 'text-green-500' : 'text-[#3B82F6]';

    return (
        <View className={`bg-gray-900 p-5 rounded-xl border ${borderColor} mb-4`} style={{ position: 'relative', zIndex: 1 }}>
            {showTooltip && (
                <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipText}>タスクを完了するとバフが翌日の診断に適用されます</Text>
                    <View style={styles.tooltipArrow} />
                </View>
            )}

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500 text-[10px] tracking-widest uppercase">Tasks Summary</Text>
                <Feather name={isAllCompleted ? "check-circle" : "check-square"} size={16} color={isAllCompleted ? "#22c55e" : "#3B82F6"} />
            </View>

            <View className="flex-row justify-between items-end mb-2">
                <View>
                    <Text className={`${textColor} text-lg font-bold`}>
                        今日のタスク {isAllCompleted ? "✓" : ""}
                    </Text>
                    <Text className={`${subTextColor} text-xs mt-1`}>残り {timeLeft}</Text>
                </View>
                <View className="flex-row items-baseline">
                    <Text className={`${countColor} text-3xl font-bold`}>{completedTasks}</Text>
                    <Text className="text-gray-500 text-xl font-bold">/{totalTasks}</Text>
                </View>
            </View>

            <Pressable
                onPress={() => router.push('/(tabs)/action')}
                className="flex-row items-center justify-end mt-2"
            >
                <Text className="text-gray-400 text-xs mr-1">詳細を見る</Text>
                <Feather name="chevron-right" size={12} color="#9ca3af" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    tooltipContainer: {
        position: 'absolute',
        top: -50,
        right: 10,
        backgroundColor: '#3B82F6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        zIndex: 20,
    },
    tooltipText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tooltipArrow: {
        position: 'absolute',
        bottom: -6,
        right: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#3B82F6',
    },
});
