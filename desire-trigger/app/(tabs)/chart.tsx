import { View, Text, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import RadarChart from '../../components/ui/RadarChart';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockStore } from '../../store/mockStore';
import { useRouter } from 'expo-router';

export default function ChartScreen() {
    const { scores } = useMockStore();
    const router = useRouter();
    const screenWidth = Dimensions.get('window').width;

    const data = {
        labels: ["回復", "承認", "安心", "挑戦", "刺激", "孤独解消", "創造"],
        datasets: [
            {
                data: [
                    scores.recovery,
                    scores.recognition,
                    scores.security,
                    scores.challenge,
                    scores.stimulation,
                    scores.connection,
                    scores.creation
                ]
            }
        ]
    };

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`, // calm-500
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
        strokeWidth: 2,
        barPercentage: 0.5,
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                <Text className="text-2xl font-bold text-gray-800 mb-2">今のあなたの欲求</Text>
                <Text className="text-gray-500 mb-8">回答に基づいて分析しました</Text>

                <View className="items-center -ml-6 mb-8">
                    <RadarChart
                        data={data}
                        width={screenWidth - 48}
                        height={300}
                    />
                </View>

                <View className="bg-purple-50 p-6 rounded-2xl mb-8 border border-purple-100">
                    <Text className="text-calm-500 font-bold text-lg mb-2">今、あなたが最も求めているもの</Text>
                    <View className="flex-row items-baseline mb-2">
                        <Text className="text-4xl font-bold text-gray-800 mr-2">回復</Text>
                        <Text className="text-xl text-calm-500 font-bold">(75点)</Text>
                    </View>
                    <Text className="text-gray-600 leading-relaxed">
                        疲れが溜まっています。リラックスする時間を作りましょう。
                    </Text>
                </View>

                <TouchableOpacity
                    className="bg-gray-800 w-full py-4 rounded-xl items-center shadow-md active:opacity-80"
                    onPress={() => router.push('/(tabs)/actions')}
                >
                    <Text className="text-white text-lg font-bold">今日のおすすめ行動を見る</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
