import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SystemAnalysisCard() {
    return (
        <View className="bg-gray-900/80 p-5 rounded-2xl mb-8 border border-gray-800">
            <View className="flex-row items-center mb-3">
                <Feather name="cpu" size={16} color="#3B82F6" />
                <Text className="text-[#3B82F6] font-bold ml-2 text-[10px] tracking-widest uppercase">System Analysis</Text>
            </View>
            <Text className="text-gray-400 text-sm leading-6">
                日々の質問に答えることで、あなたの状態を可視化します。
            </Text>
        </View>
    );
}
