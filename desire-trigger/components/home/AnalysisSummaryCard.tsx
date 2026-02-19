import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data for now, or props?
// Spec says: Dominant metric only.
// Let's accept content props.

type Props = {
    dominantMetric: string;
    value: number; // 0-100
    showTooltip?: boolean;
};

export default function AnalysisSummaryCard({ dominantMetric, value, showTooltip }: Props) {
    const router = useRouter();

    return (
        <View className="bg-gray-900 p-5 rounded-xl border border-gray-800 mb-4" style={{ position: 'relative', zIndex: 1 }}>
            {showTooltip && (
                <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipText}>最も高い指標を表示しています</Text>
                    <View style={styles.tooltipArrow} />
                </View>
            )}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500 text-[10px] tracking-widest uppercase">Analysis Summary</Text>
                <Feather name="bar-chart-2" size={16} color="#4ade80" />
            </View>

            <View className="flex-row items-end mb-2">
                <Text className="text-white text-3xl font-bold mr-3">{dominantMetric}</Text>
                <Text className="text-[#4ade80] text-2xl font-bold">{value}</Text>
                <Text className="text-gray-500 text-sm mb-1 ml-1">/ 100</Text>
            </View>

            <Pressable
                onPress={() => router.push('/(tabs)/chart')}
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
        top: -40,
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
