import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockStore } from '../../store/mockStore';
import { useRouter } from 'expo-router';

export default function ActionsScreen() {
    const { actions } = useMockStore();
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                <Text className="text-2xl font-bold text-gray-800 mb-6">今日のおすすめ行動</Text>

                {actions.map((action) => (
                    <TouchableOpacity key={action.id} className="bg-white border border-gray-100 p-5 rounded-2xl mb-4 shadow-sm active:bg-gray-50">
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">{action.title}</Text>
                            <View className="bg-calm-500/10 px-3 py-1 rounded-full">
                                <Text className="text-calm-500 text-xs font-bold">{action.category}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-600 mb-3 leading-relaxed">{action.description}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-gray-400 text-sm mr-4">⏱ {action.duration}分</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    className="bg-gray-800 w-full py-4 rounded-xl items-center shadow-md active:opacity-80 mt-4"
                    onPress={() => router.push('/reflection')}
                >
                    <Text className="text-white text-lg font-bold">今日の振り返りへ</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
