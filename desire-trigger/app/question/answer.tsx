import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockStore } from '../../store/mockStore';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  runOnJS,
  interpolateColor,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  SharedValue // 🚀 TSエラー対策：型を直接インポート
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.2; 

const COLOR_YES = '#39FF14'; 
const COLOR_NO = '#EF4444';
const STAR_COLOR = '#A5F3FC';

// ✨ 星のコンポーネント（加速対応版）
const Star = ({ warpFactor }: { warpFactor: SharedValue<number> }) => {
  const travel = useSharedValue(0);
  const angle = useMemo(() => Math.random() * Math.PI * 2, []); 
  const delay = useMemo(() => Math.random() * 2000, []); 
  // 🚀 指定の速度：1200ms
  const baseDuration = useMemo(() => 1200 + Math.random() * 100, []); 

  useEffect(() => {
    travel.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: baseDuration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const starStyle = useAnimatedStyle(() => {
    const r = travel.value * (width > height ? width : height) * 1.3;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    
    // 🚀 加速時は光の筋を50倍に伸ばす
    const stretch = interpolate(warpFactor.value, [0, 1], [1, 50]); 
    const baseHeight = interpolate(travel.value, [0, 1], [1, 40]);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${angle + Math.PI / 2}rad` },
        { scaleY: interpolate(travel.value, [0, 1], [0.1, 4]) * stretch }
      ],
      opacity: interpolate(travel.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
      width: interpolate(warpFactor.value, [0, 1], [2, 1.2]),
      height: baseHeight,
    };
  });

  return (
    <Animated.View 
      style={[{ position: 'absolute', backgroundColor: STAR_COLOR, borderRadius: 1 }, starStyle]} 
    />
  );
};

export default function QuestionAnswerScreen() {
  const router = useRouter();
  const { currentQuestionIndex, questions, nextQuestion, setAnswer } = useMockStore();
  const currentQuestion = questions[currentQuestionIndex];

  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const warpFactor = useSharedValue(0); // 🚀 加速用
  const whiteoutOpacity = useSharedValue(0); // 🚀 ホワイトアウト用

  // 🚀 指定の数：70個
  const stars = useMemo(() => Array.from({ length: 70 }), []);

  const triggerWarpSequence = () => {
    // 1. 猛烈に加速
    warpFactor.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.5, 0, 1, 1) });
    // 2. ホワイトアウト開始
    whiteoutOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // 3. ホワイトアウトのピークで遷移
    setTimeout(() => {
      runOnJS(navigateToComplete)();
    }, 1100);
  };

  const navigateToComplete = () => {
    router.replace('/question/complete');
  };

  const onAnswerComplete = (answer: 'YES' | 'NO' | 'UNKNOWN') => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, answer);
      translateX.value = 0;
      rotate.value = 0;

      // 🚀 最後の質問かチェック
      if (currentQuestionIndex === questions.length - 1) {
        triggerWarpSequence();
      } else {
        nextQuestion();
      }
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (warpFactor.value > 0) return;
      translateX.value = event.translationX;
      rotate.value = interpolate(event.translationX, [-width / 2, width / 2], [-8, 8]);
    })
    .onEnd((event) => {
      if (warpFactor.value > 0) return;
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width, {}, () => runOnJS(onAnswerComplete)('YES'));
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width, {}, () => runOnJS(onAnswerComplete)('NO'));
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(translateX.value, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [COLOR_NO, '#2A2A2A', COLOR_YES]);
    const backgroundColor = interpolateColor(translateX.value, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [`${COLOR_NO}45`, '#111', `${COLOR_YES}45`]);
    
    // 🚀 加速時はカードを消す
    const scale = interpolate(warpFactor.value, [0, 0.4], [1, 0]);
    const opacity = interpolate(warpFactor.value, [0, 0.3], [1, 0]);

    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }, { scale }],
      borderColor,
      backgroundColor,
      opacity,
    };
  });

  const yesOpacity = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]) }));
  const noOpacity = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]) }));

  const noHintStyle = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0.4]) }));
  const yesHintStyle = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.4, 1]) }));

  const whiteoutStyle = useAnimatedStyle(() => ({
    opacity: whiteoutOpacity.value,
  }));

  if (!currentQuestion && warpFactor.value === 0) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        {/* 背景：スターフィールド */}
        <View style={styles.starField} pointerEvents="none">
          {stars.map((_, i) => <Star key={i} warpFactor={warpFactor} />)}
        </View>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Feather name="chevron-left" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{`PROTOCOL: ${currentQuestionIndex + 1}/${questions.length}`}</Text>
          <View style={{ width: 36 }} />
        </View>

        <View className="flex-1 justify-center items-center">
          <GestureDetector gesture={gesture}>
            <Animated.View 
              style={[animatedCardStyle, styles.card]}
              className="px-6 rounded-[24px] items-center justify-center relative shadow-2xl"
            >
              <Text className="text-base font-bold text-white text-center leading-6 mb-6">
                {currentQuestion?.text || ""}
              </Text>

              {/* 操作ガイド */}
              <View className="flex-row justify-between w-full px-2 absolute bottom-5">
                <Animated.View style={[styles.hintContainer, noHintStyle, { flexDirection: 'row' }]}>
                  <Feather name="chevron-left" size={18} color={COLOR_NO} />
                  <Text style={[styles.hintText, { color: COLOR_NO }]}>NO</Text>
                </Animated.View>
                <Animated.View style={[styles.hintContainer, yesHintStyle, { flexDirection: 'row-reverse' }]}>
                  <Feather name="chevron-right" size={18} color={COLOR_YES} />
                  <Text style={[styles.hintText, { color: COLOR_YES }]}>YES</Text>
                </Animated.View>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        <View className="items-center pb-8">
          <TouchableOpacity onPress={() => onAnswerComplete('UNKNOWN')}>
            <Text className="text-gray-700 text-[8px] font-bold tracking-[0.4em] uppercase underline">Skip Sync</Text>
          </TouchableOpacity>
        </View>

        {/* 🚀 ホワイトアウトレイヤー */}
        <Animated.View 
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF' }, whiteoutStyle]} 
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerText: { color: '#1A1A1A', fontFamily: 'monospace', fontSize: 8, letterSpacing: 1 },
  card: { width: width * 0.7, height: 220, borderWidth: 1.2 },
  starField: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  hintContainer: { alignItems: 'center', padding: 4, opacity: 0.4 },
  hintText: { fontSize: 12, fontWeight: 'bold', marginHorizontal: 4, fontFamily: 'monospace' }
});