import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function QuestionStartScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="items-center mb-12">
                <View className="bg-purple-50 w-24 h-24 rounded-full items-center justify-center mb-6">
                    <Feather name="feather" size={40} color="#a78bfa" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    1日1回のチェックイン
                </Text>
                <Text className="text-gray-500 text-center leading-relaxed">
                    3-5問の質問に答えて、{"\n"}今のあなたの状態を可視化しましょう。
                </Text>
            </View>

            <TouchableOpacity
                className="bg-calm-500 w-full py-4 rounded-xl items-center shadow-md active:opacity-80 mb-4"
                onPress={() => router.push('/question/answer')}
            >
                <Text className="text-white text-lg font-bold">はじめる</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="p-4"
                onPress={() => router.back()}
            >
                <Text className="text-gray-400 font-medium">あとで</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
