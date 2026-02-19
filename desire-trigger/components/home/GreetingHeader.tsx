import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
    userName: string;
    onSettingsPress: () => void;
    onLongPress: () => void;
};

export default function GreetingHeader({ userName, onSettingsPress, onLongPress }: Props) {
    const hour = new Date().getHours();
    // Simple greeting logic based on time
    const getGreeting = () => {
        // Or just "Hello" as per spec? Let's check spec.
        // Spec: "[ユーザー名]さん、はじめまして。" or "おかえりなさい。"
        // It depends on state (First time vs Recurring).
        // Let's make it flexible or just use "おかえりなさい" for now as default, 
        // but the spec says "はじめまして" for first time.
        // The parent component should probably pass the full message or we can infer.
        // Getting the full greeting text or mode might be better.
        // Let's stick to props for flexibility.
        return "";
    };

    return (
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <TouchableOpacity onLongPress={onLongPress} delayLongPress={1500}>
                    <Text className="text-slate-400 text-xs font-bold mb-1 tracking-[0.15em]">DASHBOARD</Text>
                </TouchableOpacity>
                <Text className="text-slate-50 text-2xl font-bold">
                    ステータス概要
                </Text>
            </View>
            <TouchableOpacity
                className="bg-slate-800 p-3 rounded-full"
                onPress={onSettingsPress}
            >
                <Feather name="settings" size={20} color="#9ca3af" />
            </TouchableOpacity>
        </View>
    );
}
