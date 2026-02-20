import { View, Text, StyleSheet } from 'react-native';
import { DayDetail as DayDetailType, MetricKey, DBTask } from '../../types';
import { METRIC_COLORS } from '../../constants/mockData';
import { Feather } from '@expo/vector-icons';

interface DayDetailProps {
    selectedDayDetail: DayDetailType | null;
    loading?: boolean;
}

// 日本語名からMetricKeyへのマッピング
const japaneseToPrimaryMetric: Record<string, MetricKey> = {
    '探索': 'exploration',
    '没頭': 'immersion',
    '整理': 'organization',
    '貢献': 'contribution',
    '元気': 'vitality',
};

// MetricKeyから日本語へのマッピング
const metricToJapanese: Record<MetricKey, string> = {
    exploration: '探索',
    immersion: '没頭',
    organization: '整理',
    contribution: '貢献',
    vitality: '元気',
};

// MetricKeyから色へのマッピング（PrimaryMetricの色を使用）
const metricToColor: Record<MetricKey, string> = {
    exploration: '#3B82F6', // Blue
    immersion: '#10B981',   // Emerald
    organization: '#8B5CF6', // Violet
    contribution: '#F97316', // Orange
    vitality: '#06B6D4',    // Cyan
};

export default function DayDetail({ selectedDayDetail, loading }: DayDetailProps) {
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center p-6">
                <Text className="text-gray-500">読み込み中...</Text>
            </View>
        );
    }

    if (!selectedDayDetail) {
        return (
            <View className="flex-1 items-center justify-center p-6 opacity-50">
                <Feather name="bar-chart-2" size={48} color="#64748b" />
                <Text className="text-gray-500 mt-4 text-center">
                    日付をタップして詳細を表示
                </Text>
            </View>
        );
    }

    const { diagnostic, completedTasks } = selectedDayDetail;

    // 最高値のメトリックを取得
    const metrics: Record<MetricKey, number> = {
        exploration: diagnostic.exploration,
        immersion: diagnostic.immersion,
        organization: diagnostic.organization,
        contribution: diagnostic.contribution,
        vitality: diagnostic.vitality,
    };

    const topMetricEntry = Object.entries(metrics).reduce(
        (max, [key, value]) => value > max.value ? { key: key as MetricKey, value } : max,
        { key: 'exploration' as MetricKey, value: -Infinity }
    );

    const topMetricKey = topMetricEntry.key;
    const topMetricScore = Math.round(topMetricEntry.value);
    const color = metricToColor[topMetricKey];
    const label = metricToJapanese[topMetricKey];

    // タスクの難易度ラベル
    const levelToLabel: Record<string, string> = {
        'quick': 'QUICK',
        'core': 'CORE',
        'deep': 'DEEP',
    };

    // タスクのカテゴリからパラメータの色へのマッピング
    const categoryToColor: Record<string, string> = {
        '探索系': metricToColor.exploration,
        '集中系': metricToColor.immersion,
        '没頭系': metricToColor.immersion,
        '実行系': metricToColor.organization,
        '整理系': metricToColor.organization,
        '貢献系': metricToColor.contribution,
        '休息系': metricToColor.vitality,
        '元気系': metricToColor.vitality,
    };

    return (
        <View className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <View className="flex-row items-center justify-between mb-6">
                <View>
                    <Text className="text-gray-400 text-xs font-bold mb-1 tracking-widest">
                        {diagnostic.date}
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
                        {topMetricScore}
                    </Text>
                </View>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-400 mb-2 font-bold text-xs">完了したタスク</Text>
                    {completedTasks && completedTasks.length > 0 ? (
                        completedTasks.map((task: DBTask) => {
                            // 各タスクのカテゴリに応じた色を使用
                            const taskColor = categoryToColor[task.category] || metricToColor.exploration; // デフォルトは探索
                            const taskLabel = levelToLabel[task.level] || task.level.toUpperCase();

                            return (
                                <View key={task.id} className="flex-row items-center justify-between bg-gray-700/50 p-3 rounded-lg mb-2">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View
                                            style={{ backgroundColor: taskColor }}
                                            className="w-2 h-2 rounded-full mr-3"
                                        />
                                        <Text className="text-white font-medium truncate" numberOfLines={1}>{task.title}</Text>
                                    </View>
                                    <View style={{ backgroundColor: `${taskColor}33`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                        <Text style={{ color: taskColor, fontSize: 10, fontWeight: 'bold' }}>
                                            {taskLabel}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text className="text-gray-500 italic">完了したタスクはありません。</Text>
                    )}
                </View>
            </View>
        </View>
    );
}
