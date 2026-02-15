import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function TitleScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
            <StatusBar style="dark" />
            <View className="items-center mb-16 px-6">
                <Text className="text-4xl font-bold text-gray-800 mb-4 text-center">
                    Desire Trigger
                </Text>
                <Text className="text-lg text-gray-500 text-center">
                    あなたも気づいていない"本当の欲求"を、{"\n"}毎日の質問で発見する
                </Text>
            </View>

            <TouchableOpacity
                className="bg-calm-500 px-12 py-4 rounded-full shadow-lg active:opacity-80"
                onPress={() => router.replace('/(tabs)')}
            >
                <Text className="text-white text-xl font-bold">スタート</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
