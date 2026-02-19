import { View, Text, StyleSheet } from 'react-native';
import { HistoryLog } from '../../types';
import { METRIC_COLORS, METRIC_LABELS } from '../../lib/constants';
import { Feather } from '@expo/vector-icons';

interface DayDetailProps {
    selectedDay: HistoryLog | null;
}

export default function DayDetail({ selectedDay }: DayDetailProps) {
    if (!selectedDay) {
        return (
            <View className="flex-1 items-center justify-center p-6 opacity-50">
                <Feather name="bar-chart-2" size={48} color="#64748b" />
                <Text className="text-gray-500 mt-4 text-center">
                    日付をタップして詳細を表示
                </Text>
            </View>
        );
    }

    const color = METRIC_COLORS[selectedDay.primaryMetric];
    const label = METRIC_LABELS[selectedDay.primaryMetric];

    return (
        <View className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <View className="flex-row items-center justify-between mb-6">
                <View>
                    <Text className="text-gray-400 text-xs font-bold mb-1 tracking-widest">
                        {selectedDay.date}
                    </Text>
                    <View className="flex-row items-center">
                        <View
                            style={{ backgroundColor: color }}
                            className="w-3 h-3 rounded-full mr-2"
                        />
                        <Text className="text-white text-2xl font-bold">
                            {label}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-xs font-bold">SCORE</Text>
                    <Text style={{ color: color }} className="text-3xl font-bold">
                        {selectedDay.score}
                    </Text>
                </View>
            </View>

            <View className="space-y-4">
                {/* Mock breakdown of metrics */}
                <View>
                    <Text className="text-gray-400 mb-2 font-bold text-xs">完了したタスク</Text>
                    {selectedDay.taskList && selectedDay.taskList.length > 0 ? (
                        selectedDay.taskList.map((task, index) => (
                            <View key={index} className="flex-row items-center justify-between bg-gray-700/50 p-3 rounded-lg mb-2">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className={`w-2 h-2 rounded-full mr-3 ${task.isCompleted
                                        ? (task.color === 'Core' ? 'bg-blue-500' : task.color === 'Deep' ? 'bg-purple-500' : 'bg-green-500')
                                        : 'bg-gray-500'
                                        }`} />
                                    <Text className="text-white font-medium truncate" numberOfLines={1}>{task.title}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded text-xs ${task.color === 'Core' ? 'bg-blue-500/20' :
                                    task.color === 'Deep' ? 'bg-purple-500/20' : 'bg-green-500/20'
                                    }`}>
                                    <Text className={`text-[10px] font-bold ${task.color === 'Core' ? 'text-blue-400' :
                                        task.color === 'Deep' ? 'text-purple-400' : 'text-green-400'
                                        }`}>
                                        {(task.color || 'Quick').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic">タスクの記録はありません。</Text>
                    )}
                </View>
            </View>
        </View >
    );
}
