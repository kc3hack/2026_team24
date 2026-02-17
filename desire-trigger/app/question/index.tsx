import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function QuestionStartScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#121212] items-center justify-center p-6">
      <View className="items-center mb-16">
        <View className="bg-blue-500/10 w-24 h-24 rounded-full items-center justify-center mb-8 border border-blue-500/20">
          <Feather name="cpu" size={40} color="#3B82F6" />
        </View>
        <Text className="text-gray-500 text-[10px] tracking-[0.3em] uppercase mb-2">Daily Protocol</Text>
        <Text className="text-white text-3xl font-bold mb-4 text-center">状態スキャン</Text>
        <Text className="text-gray-400 text-center leading-relaxed text-sm px-6">
          現在のニューラル状態を同期するために、いくつかの質問に回答してください。
        </Text>
      </View>

      <TouchableOpacity
        className="bg-[#3B82F6] w-full py-5 rounded-2xl items-center shadow-lg active:opacity-90 mb-6"
        // 確実に /question/answer へ飛ばす
        onPress={() => router.push('/question/answer')}
      >
        <Text className="text-white text-lg font-bold tracking-widest">スキャン開始</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-gray-600 font-bold tracking-widest text-[10px]">ABORT_SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}