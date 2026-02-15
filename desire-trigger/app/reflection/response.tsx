import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReflectionResponseScreen() {
    const router = useRouter();

    const handleClose = () => {
        // Dismiss all modals and go back to root/tabs
        router.dismissAll();
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="bg-purple-50 p-8 rounded-2xl border border-purple-100 w-full mb-8">
                <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">AIからの返信</Text>
                <Text className="text-gray-600 leading-relaxed mb-6 text-lg">
                    お疲れ様でした！今日は素晴らしい1日だったようですね。
                    あなたの頑張りが伝わってきます。ゆっくり休んでください。
                </Text>
                <View className="bg-white/50 p-4 rounded-xl items-center">
                    <Text className="text-calm-500 font-bold text-base">📊 欲求スコアを調整しました</Text>
                </View>
            </View>

            <TouchableOpacity
                className="bg-gray-800 w-full py-4 rounded-xl items-center shadow-md active:opacity-80"
                onPress={handleClose}
            >
                <Text className="text-white text-lg font-bold">閉じる</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
