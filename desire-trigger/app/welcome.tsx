import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    router.replace('/setup');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212] px-8 justify-center">
      <View className="items-center mb-12">
        <View className="w-20 h-20 bg-[#3B82F6]/10 rounded-full items-center justify-center mb-6 border border-[#3B82F6]/30">
          <Feather name="shield" size={40} color="#3B82F6" />
        </View>
        <Text className="text-white text-3xl font-bold text-center">WELCOME TO{"\n"}DESIRE_TRIGGER</Text>
      </View>
      <TouchableOpacity onPress={handleStart} className="bg-[#3B82F6] py-5 rounded-2xl flex-row justify-center items-center">
        <Text className="text-white font-bold text-lg mr-2">START_SESSION</Text>
        <Feather name="arrow-right" size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}