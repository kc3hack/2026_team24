import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Feather } from '@expo/vector-icons';

export default function QuestionCompleteScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Navigate to chart in the main tabs
            // We need to dismiss the modal stack first or navigate to root
            router.dismissAll();
            router.replace('/(tabs)/chart');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="items-center">
                <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-6">
                    <Feather name="check" size={40} color="#22c55e" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    完了しました！
                </Text>
                <Text className="text-gray-500 text-center mb-8">
                    分析結果を作成しています...
                </Text>
                <ActivityIndicator size="large" color="#a78bfa" />
            </View>
        </SafeAreaView>
    );
}
