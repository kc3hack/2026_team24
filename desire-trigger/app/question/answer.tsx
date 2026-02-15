import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockStore } from '../../store/mockStore';
import { useEffect } from 'react';
import { Feather } from '@expo/vector-icons';

export default function QuestionAnswerScreen() {
    const router = useRouter();
    const { currentQuestionIndex, questions, nextQuestion, setAnswer } = useMockStore();
    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        if (currentQuestionIndex >= questions.length) {
            router.replace('/question/complete');
        }
    }, [currentQuestionIndex, questions.length]);

    if (!currentQuestion) return null;

    const handleAnswer = (answer: 'YES' | 'NO' | 'UNKNOWN') => {
        setAnswer(currentQuestion.id, answer);
        nextQuestion();
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="x" size={24} color="#9ca3af" />
                </TouchableOpacity>
                <Text className="text-gray-500 font-medium">{currentQuestionIndex + 1} / {questions.length}</Text>
                <View className="w-8" />
            </View>

            <View className="flex-1 justify-center items-center">
                <View className="bg-gray-50 p-8 rounded-2xl w-full shadow-sm mb-12">
                    <Text className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                        {currentQuestion.text}
                    </Text>
                </View>

                <View className="w-full gap-4">
                    <TouchableOpacity
                        className="bg-calm-500 w-full py-4 rounded-xl items-center shadow-md active:opacity-80"
                        onPress={() => handleAnswer('YES')}
                    >
                        <Text className="text-white text-lg font-bold">はい</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-200 w-full py-4 rounded-xl items-center active:bg-gray-300"
                        onPress={() => handleAnswer('NO')}
                    >
                        <Text className="text-gray-700 text-lg font-bold">いいえ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-transparent w-full py-4 items-center"
                        onPress={() => handleAnswer('UNKNOWN')}
                    >
                        <Text className="text-gray-400 text-base font-medium">わからない</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
