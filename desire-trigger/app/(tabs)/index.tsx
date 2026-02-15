import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="mb-8">
          <Text className="text-gray-500 font-medium mb-1">こんにちは</Text>
          <Text className="text-3xl font-bold text-gray-800">今日も自分と{"\n"}向き合いましょう</Text>
        </View>

        <View className="bg-purple-50 p-6 rounded-3xl mb-8 relative overflow-hidden">
          <View className="absolute right-0 top-0 opacity-10">
            <Feather name="message-circle" size={120} color="#a78bfa" />
          </View>
          <Text className="text-calm-500 font-bold mb-2">DAILY CHECK-IN</Text>
          <Text className="text-xl font-bold text-gray-800 mb-6">今日の気分はどうですか？</Text>

          <TouchableOpacity
            className="bg-calm-500 py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md active:opacity-90"
            onPress={() => router.push('/question')}
          >
            <Feather name="play" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">質問を始める</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text className="text-lg font-bold text-gray-800 mb-4">最近の記録</Text>
          {/* Placeholder for history */}
          <View className="bg-gray-50 p-4 rounded-xl mb-3 flex-row items-center">
            <View className="bg-gray-200 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Feather name="check" size={20} color="gray" />
            </View>
            <View>
              <Text className="font-bold text-gray-700">昨日のチェックイン</Text>
              <Text className="text-gray-400 text-xs">完了</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
