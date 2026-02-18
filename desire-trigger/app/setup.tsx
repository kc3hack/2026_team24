import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showPicker, setShowPicker] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    ageGroup: '',
    lifestyle: '',
    interest: '',
    jobType: '',
    techStack: '',
    currentMode: '',
    notifTime: new Date(new Date().setHours(21, 0, 0, 0)),
    weekdayFreeTime: '2',
    weekendFreeTime: '5',
  });

  const nextStep = () => {
    if (step === 1 && !formData.userName.trim()) {
      alert("ユーザー名を入力してください");
      return;
    }

    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(s => s + 1);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const saveAndFinish = async () => {
    if (!formData.userName.trim()) {
      alert("ユーザー名を入力してください");
      return;
    }

    try {
      const timeStr = `${formData.notifTime.getHours()}:${formData.notifTime.getMinutes().toString().padStart(2, '0')}`;
      const data: [string, string][] = [
        ['userName', String(formData.userName)],
        ['ageGroup', String(formData.ageGroup)],
        ['lifestyle', String(formData.lifestyle)],
        ['interest', String(formData.interest)],
        ['jobType', String(formData.jobType)],
        ['techStack', String(formData.techStack)],
        ['currentMode', String(formData.currentMode)],
        ['notifTime', timeStr],
        ['weekdayFreeTime', String(formData.weekdayFreeTime)],
        ['weekendFreeTime', String(formData.weekendFreeTime)],
        ['hasLaunched', 'true']
      ];
      await AsyncStorage.multiSet(data);
      router.replace('/question/answer'); // 初回のみ直接質問へ
    } catch (e) {
      console.error(e);
    }
  };

  const SelectChip = ({ label, value, field }: { label: string, value: string, field: keyof typeof formData }) => (
    <Pressable
      onPress={() => setFormData({ ...formData, [field]: value })}
      className={`px-4 py-3 rounded-xl border mr-2 mb-2 ${formData[field] === value ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-gray-900 border-gray-700'}`}
    >
      <Text className={`font-bold ${formData[field] === value ? 'text-white' : 'text-gray-400'}`}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
          <ScrollView className="flex-1 px-8 pt-8" keyboardShouldPersistTaps="handled">
            {step === 1 && (
              <View>
                <Text className="text-[#3B82F6] font-bold mb-2 tracking-widest">{'>{'} PHASE_01</Text>
                <Text className="text-white text-3xl font-bold mb-8">IDENTITY</Text>
                <TextInput
                  className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-white text-lg font-bold mb-6"
                  placeholder="ユーザー名" placeholderTextColor="#4b5563"
                  value={formData.userName} onChangeText={(t) => setFormData({ ...formData, userName: t })}
                />
                <View className="flex-row flex-wrap mb-6">
                  {['10代', '20代', '30代', '40代'].map(v => <SelectChip key={v} label={v} value={v} field="ageGroup" />)}
                </View>
                <View className="flex-row flex-wrap mb-10">
                  {['学生', '社会人', 'その他'].map(v => <SelectChip key={v} label={v} value={v} field="lifestyle" />)}
                </View>
                <Pressable onPress={nextStep} className="bg-[#3B82F6] py-5 rounded-2xl items-center">
                  <Text className="text-white font-bold text-lg">NEXT_PHASE</Text>
                </Pressable>
              </View>
            )}
            {step === 2 && (
              <View>
                <Text className="text-[#3B82F6] font-bold mb-2 tracking-widest">{'>{'} PHASE_02</Text>
                <Text className="text-white text-3xl font-bold mb-8">EXPERTISE</Text>
                <View className="flex-row flex-wrap mb-6">
                  {['仕事', '趣味', '人間関係'].map(v => <SelectChip key={v} label={v} value={v} field="interest" />)}
                </View>
                <View className="flex-row flex-wrap mb-10">
                  {['開発者', 'デザイナー', 'その他'].map(v => <SelectChip key={v} label={v} value={v} field="jobType" />)}
                </View>
                <Pressable onPress={nextStep} className="bg-[#3B82F6] py-5 rounded-2xl items-center">
                  <Text className="text-white font-bold text-lg">NEXT_PHASE</Text>
                </Pressable>
              </View>
            )}
            {step === 3 && (
              <View>
                <Text className="text-[#3B82F6] font-bold mb-2 tracking-widest">{'>{'} PHASE_03</Text>
                <Text className="text-white text-3xl font-bold mb-8">CONFIG</Text>
                <Pressable onPress={() => setShowPicker(true)} className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 mb-10">
                  <Text className="text-white text-xl font-bold">通知時間: {formData.notifTime.getHours()}:{formData.notifTime.getMinutes().toString().padStart(2, '0')}</Text>
                </Pressable>
                {showPicker && (
                  <DateTimePicker
                    value={formData.notifTime} mode="time" display="spinner" is24Hour={true}
                    onChange={(e, d) => { setShowPicker(Platform.OS === 'ios'); if (d) setFormData({ ...formData, notifTime: d }) }}
                  />
                )}
                <Pressable onPress={saveAndFinish} className="bg-green-600 py-5 rounded-2xl items-center">
                  <Text className="text-white font-bold text-lg">INITIALIZE_SYSTEM</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}