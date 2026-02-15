import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

export default function ReflectionInputScreen() {
    const router = useRouter();
    const [text, setText] = useState('');

    const handleSubmit = () => {
        // Navigate to response screen
        router.push('/reflection/response');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-gray-800">今日のひとこと</Text>
                        <TouchableOpacity onPress={() => router.back()} className="p-2 -mr-2">
                            <Feather name="x" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-gray-50 p-6 rounded-2xl mb-6">
                        <Text className="text-gray-600 font-medium mb-2">AIからの質問</Text>
                        <Text className="text-lg font-bold text-gray-800">今日はどんな1日でしたか?</Text>
                    </View>

                    <TextInput
                        className="bg-gray-50 p-4 rounded-xl text-gray-800 mb-6 h-40 text-lg leading-relaxed"
                        multiline
                        placeholder="ここに自由に書いてください..."
                        value={text}
                        onChangeText={setText}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        className="bg-calm-500 w-full py-4 rounded-xl items-center shadow-md active:opacity-80 disabled:opacity-50 mb-4"
                        onPress={handleSubmit}
                        disabled={!text.trim()}
                    >
                        <Text className="text-white text-lg font-bold">送信</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-transparent w-full py-2 items-center"
                        onPress={() => router.back()}
                    >
                        <Text className="text-gray-400 font-medium">今日はスキップ</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
