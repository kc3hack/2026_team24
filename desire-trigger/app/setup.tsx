import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Animated, KeyboardAvoidingView, Platform, Dimensions, LayoutAnimation, UIManager, Keyboard, Easing, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { scheduleNotification } from '../hooks/useNotification';
import SelectionGrid from '../components/setup/SelectionGrid';
import StarryBackground from '../components/ui/StarryBackground';
import { createUser } from '../supabase/profiles';
import { createInitialDiagnostic } from '../supabase/diagnostics';
import { getSessionDate } from '../lib/dateUtils';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

// Types
type SetupStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;



type FormData = {
  userName: string;
  techStack: string[];
  techOther: string;
  hobbies: string[];
  hobbiesOther: string;
  worries: string[];
  worriesOther: string;
  selectedMode: string;
  notifTime: Date;
};

// Constants
const TECH_STACK_OPTIONS = [
  'フロントエンド', 'バックエンド', 'モバイル', 'インフラ・クラウド',
  'AI・ML', 'セキュリティ', 'データ', 'ゲーム開発',
  'その他'
];

const WORRIES_OPTIONS = [
  '人間関係', 'スキル・成長', '締め切り・納期', '将来・キャリア',
  'モチベーション', '睡眠・体調', '評価・承認', 'お金',
  'その他'
];

const HOBBIES = ['読書', 'ゲーム', '映画', '料理', '旅行', '筋トレ', '音楽', '創作', 'その他'];

const MODES = [
  { name: '探索', emoji: '🚀', label: '全力疾走' },
  { name: '没頭', emoji: '📚', label: 'インプット期' },
  { name: '整理', emoji: '🧹', label: 'リセット中' },
  { name: '貢献', emoji: '🤝', label: 'つながりたい' },
  { name: '元気', emoji: '⚡', label: 'エネルギー満タン' },
];

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>(0);
  const slideAnim = useRef(new Animated.Value(0)).current;


  // Progress Bar Animation State
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);

  // Form Data
  // Form Data
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    techStack: [],
    techOther: '',
    hobbies: [],
    hobbiesOther: '',
    worries: [],
    worriesOther: '',
    selectedMode: '',
    notifTime: new Date(new Date().setHours(21, 0, 0, 0)),
  });

  const [notifPermission, setNotifPermission] = useState<Notifications.PermissionStatus | null>(null);

  const [showPicker, setShowPicker] = useState(false);

  // Helper to update form safely
  const updateForm = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'techStack' | 'hobbies' | 'worries', item: string) => {
    setFormData(prev => {
      const list = prev[key];
      if (list.includes(item)) {
        return { ...prev, [key]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...list, item] };
      }
    });
    Haptics.selectionAsync();
  };

  const handleNext = () => {
    Keyboard.dismiss();

    // Validation
    if (step === 1 && !formData.userName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return alert("名前を入力してください");
    }
    if (step === 2 && formData.techStack.length === 0) return alert("好きな技術を1つ以上選択してください");
    if (step === 3 && formData.hobbies.length === 0) return alert("趣味を1つ以上選択してください");
    if (step === 4 && formData.worries.length === 0) return alert("悩みやすいことを1つ以上選択してください");
    if (step === 5 && !formData.selectedMode) return alert("モードを選択してください");

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step < 6) {
      setStep(s => (s + 1) as SetupStep);
    } else {
      saveAndFinish();
    }
  };

  // Reset animation when step changes
  useEffect(() => {
    slideAnim.setValue(0);
  }, [step]);

  const handleBack = () => {
    if (step === 0) return;
    Keyboard.dismiss();
    slideAnim.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => (s - 1) as SetupStep);
  };

  // Notification Permissions
  useEffect(() => {
    if (step === 6) {
      checkNotifPermission();
    }
  }, [step]);

  const checkNotifPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotifPermission(status);
  };

  const requestNotifPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifPermission(status);
    if (status === 'granted') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveAndFinish = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. Prepare Data
      const finalTech = formData.techStack.map(t => t === 'その他' ? formData.techOther : t).filter(Boolean);
      const finalHobbies = formData.hobbies.map(h => h === 'その他' ? formData.hobbiesOther : h).filter(Boolean);
      const finalWorries = formData.worries.map(w => w === 'その他' ? formData.worriesOther : w).filter(Boolean);
      const timeStr = `${formData.notifTime.getHours()}:${formData.notifTime.getMinutes().toString().padStart(2, '0')}`;

      // 2. Create Supabase Profile
      const profileId = await createUser({
        name: formData.userName,
        job_title: finalTech[0] || 'エンジニア', // 最初の技術スタックを職種として使用
        hobbies: finalHobbies,
        interests: finalTech,
        current_mode: (formData.selectedMode as any) || 'exploration', // デフォルト値: exploration
        notify_time: timeStr,
      });

      // 2.5. Create initial diagnostic with mode-specific scores
      const modeMap: Record<string, 'exploration' | 'immersion' | 'organization' | 'contribution' | 'vitality'> = {
        '探索': 'exploration',
        '没頭': 'immersion',
        '整理': 'organization',
        '貢献': 'contribution',
        '元気': 'vitality',
      };
      const currentMode = modeMap[formData.selectedMode] || 'exploration';
      const sessionDate = await getSessionDate();
      await createInitialDiagnostic(profileId, sessionDate, currentMode);

      // 3. Schedule notification if permission granted
      if (notifPermission === 'granted') {
        await scheduleNotification(timeStr);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 4. Save to AsyncStorage
      const data: [string, string][] = [
        ['profile_id', profileId],
        ['userName', formData.userName],
        ['techStack', JSON.stringify(finalTech)],
        ['hobbies', JSON.stringify(finalHobbies)],
        ['worries', JSON.stringify(finalWorries)],
        ['selectedMode', formData.selectedMode],
        ['notifTime', timeStr],
      ];

      await AsyncStorage.multiSet(data);

      // 5. Navigate
      router.replace('/(tabs)');

    } catch (e) {
      console.error('Setup error:', e);
      alert("保存に失敗しました: " + (e instanceof Error ? e.message : String(e)));
      setIsSaving(false);
    }
  };

  // --- UI Components ---

  // Render Progress Bar
  const StepIndicator = ({ isAnimating }: { isAnimating: boolean }) => {
    // We animate the width based on 'step'.
    // Target percentage = (step / 6) * 100
    // We can animate a value 0 -> 6 and interpolate, or 0 -> 100.
    const progressAnim = useRef(new Animated.Value(step)).current;

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: step,
        duration: 600, // Faster fill (~0.6s)
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // width doesn't support native driver
      }).start();
    }, [step]);

    const widthInterp = progressAnim.interpolate({
      inputRange: [0, 6],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={{ flexDirection: 'row', height: 4, backgroundColor: '#334155', borderRadius: 2, marginBottom: 24, marginHorizontal: 4 }}>
        <Animated.View
          style={{
            width: widthInterp,
            backgroundColor: '#FBBF24',
            borderRadius: 2
          }}
        />
      </View>
    );
  };

  const Title = ({ main, sub }: { main: string, sub: string }) => (
    <View className="mb-6">
      <Text className="text-[#FBBF24] font-bold mb-1 tracking-widest text-xs">STEP {step.toString().padStart(2, '0')} / 06</Text>
      <Text className="text-white text-3xl font-bold">{main}</Text>
      <Text className="text-gray-400 text-sm mt-2">{sub}</Text>
    </View>
  );

  const ModeCard = ({ mode }: { mode: typeof MODES[0] }) => (
    <Pressable
      onPress={() => {
        updateForm('selectedMode', mode.name);
        Haptics.selectionAsync();
      }}
      className={`w-full mb-3 flex-1 rounded-2xl border flex-row items-center justify-between px-6 ${formData.selectedMode === mode.name ? 'bg-slate-800 border-[#3B82F6]' : 'bg-slate-900 border-slate-800'}`}
    >
      <View className="flex-row items-center">
        <Text className="text-4xl mr-6">{mode.emoji}</Text>
        <View>
          <Text className={`font-bold text-2xl ${formData.selectedMode === mode.name ? 'text-[#3B82F6]' : 'text-white'}`}>{mode.name}</Text>
          <Text className="text-gray-400 text-sm mt-1">{mode.label}</Text>
        </View>
      </View>
      {formData.selectedMode === mode.name && <Feather name="check" size={24} color="#3B82F6" />}
    </Pressable>
  );

  // --- Render Steps ---

  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <View className="flex-1 justify-center items-center px-4">
            <View>
              {/* Title Row */}
              <View className="flex-row items-center justify-center mb-2">
                <Text className="text-white text-2xl font-bold text-center">初期セットアップをはじめます</Text>
              </View>

              {/* Sub Text */}
              <Text className="text-gray-400 text-base text-center mt-2">あなたに合った体験をカスタマイズします</Text>
            </View>
          </View>
        );
      case 1:
        return (
          <View>
            <Title main="What is your name?" sub="あなたのお名前を教えてください" />
            <TextInput
              className="bg-slate-900 border-2 border-slate-700 rounded-xl px-5 py-4 text-white text-[18px] font-bold mb-6"
              placeholder="Display Name"
              placeholderTextColor="#475569"
              value={formData.userName}
              onChangeText={t => updateForm('userName', t)}
              autoFocus={false}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Title main="Favorite Tech" sub="好きな技術を選んでください（複数選択可）" />
            <SelectionGrid
              options={TECH_STACK_OPTIONS}
              selectedItems={formData.techStack}
              onSelect={(items) => updateForm('techStack', items)}
              otherValue={formData.techOther}
              onOtherChange={(text) => updateForm('techOther', text)}
            />
          </View>
        );
      case 3:
        return (
          <View>
            <Title main="Hobbies" sub="休日の過ごし方や好きなことは？（複数選択可）" />
            <SelectionGrid
              options={HOBBIES}
              selectedItems={formData.hobbies}
              onSelect={(items) => updateForm('hobbies', items)}
              otherValue={formData.hobbiesOther}
              onOtherChange={(text) => updateForm('hobbiesOther', text)}
            />
          </View>
        );
      case 4:
        return (
          <View>
            <Title main="Worries" sub="悩みやすいこと（複数選択可）" />
            <SelectionGrid
              options={WORRIES_OPTIONS}
              selectedItems={formData.worries}
              onSelect={(items) => updateForm('worries', items)}
              otherValue={formData.worriesOther}
              onOtherChange={(text) => updateForm('worriesOther', text)}
            />
          </View>
        );
      case 5:
        return (
          <View style={{ flex: 1 }}>
            <Title main="Current Mode" sub="今の気分や状態に最も近いモードは？" />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
              {MODES.map(mode => <ModeCard key={mode.name} mode={mode} />)}
            </ScrollView>
          </View>
        );
      case 6:
        return (
          <View className="flex-1">
            <Title main="Notification Time" sub="毎日この時間に診断をお届けします" />

            <View className="flex-1 justify-center items-center">
              <View className="items-center mb-6">
                <Feather name="clock" size={40} color="#3B82F6" style={{ marginBottom: 16 }} />
              </View>

              {/* Large Time Display */}
              <Text className="text-white font-bold text-[56px] tracking-widest text-center shadow-lg shadow-blue-500/50 mb-4">
                {formData.notifTime.getHours()}:{formData.notifTime.getMinutes().toString().padStart(2, '0')}
              </Text>

              {/* DateTimePicker */}
              <View className="mb-8" style={{ transform: [{ scale: 1.1 }] }}>
                <DateTimePicker
                  value={formData.notifTime}
                  mode="time"
                  display="spinner"
                  is24Hour={true}
                  onChange={(e, d) => {
                    if (d) updateForm('notifTime', d);
                  }}
                  textColor='white'
                  style={{ height: 120, width: 200 }}
                />
              </View>

              {/* Notification Permission UI */}
              <Pressable
                onPress={requestNotifPermission}
                className={`w-full p-6 rounded-2xl border flex-row items-center justify-between ${notifPermission === 'granted' ? 'bg-slate-800/50 border-green-500/50' : 'bg-slate-900 border-slate-800'}`}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${notifPermission === 'granted' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                    <Feather name="bell" size={24} color={notifPermission === 'granted' ? '#22c55e' : '#3B82F6'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">通知を許可する</Text>
                    <Text className="text-gray-400 text-sm">
                      {notifPermission === 'granted' ? '通知は有効です' : '質問が届くように通知をオンにしましょう'}
                    </Text>
                  </View>
                </View>
                {notifPermission === 'granted' ? (
                  <Feather name="check" size={24} color="#22c55e" />
                ) : (
                  <Feather name="chevron-right" size={24} color="#475569" />
                )}
              </Pressable>
            </View>
          </View>
        );
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      <StarryBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6 pt-4">
          {step > 0 && <StepIndicator isAnimating={false} />}

          <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
            {renderContent()}
          </Animated.View>


          <View className="flex-row justify-between mb-8 mt-4">
            {step > 0 ? (
              <Pressable onPress={handleBack} className="bg-slate-800 p-4 rounded-full w-14 h-14 items-center justify-center">
                <Feather name="arrow-left" size={24} color="white" />
              </Pressable>
            ) : <View style={{ width: 56 }} />}

            {step < 6 ? (
              <Pressable onPress={handleNext} className="bg-[#3B82F6] flex-row items-center px-8 h-14 rounded-full shadow-lg shadow-blue-500/30">
                <Text className="text-white font-bold text-lg mr-2">次へ</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </Pressable>
            ) : (
              <Pressable
                onPress={saveAndFinish}
                disabled={isSaving}
                className="bg-green-500 flex-row items-center px-8 h-14 rounded-full shadow-lg shadow-green-500/30"
                style={{ opacity: isSaving ? 0.6 : 1 }}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-2">保存中...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">開始する</Text>
                    <Feather name="check" size={20} color="white" />
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}