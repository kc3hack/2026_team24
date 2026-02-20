import React from 'react';
import { View, Text } from 'react-native';

type Props = {
    userName: string;
};

export default function GreetingHeader({ userName }: Props) {
    return (
        <View className="mb-6">
            <Text className="text-slate-400 text-xs font-bold mb-1 tracking-[0.15em]">DASHBOARD</Text>
            <Text className="text-slate-50 text-2xl font-bold">
                ステータス概要
            </Text>
        </View>
    );
}
