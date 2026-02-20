import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addAnsweredQuestionId } from '../../lib/answeredQuestions';
import { DBQuestion, QuestionAnswer } from '../../types';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  interpolateColor,
  withTiming,
  withDelay,
  Easing,
  withSequence,
  SharedValue,
  withRepeat,
  useDerivedValue
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.2;

const COLOR_YES = '#00FF2A';
const COLOR_NO = '#FF004C';
const STAR_COLOR = '#A5F3FC';

// ✨ 背景：青い光（星）
const Star = ({ warpFactor }: { warpFactor: SharedValue<number> }) => {
  const travel = useSharedValue(0);
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);
  const delay = useMemo(() => Math.random() * 2000, []);
  const baseDuration = useMemo(() => 1200 + Math.random() * 100, []);

  useEffect(() => {
    travel.value = withDelay(delay, withRepeat(withTiming(1, { duration: baseDuration, easing: Easing.linear }), -1, false));
  }, []);

  const starStyle = useAnimatedStyle(() => {
    const warp = warpFactor.value;
    const r = travel.value * (width > height ? width : height) * 1.3;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return {
      transform: [
        { translateX: x }, { translateY: y },
        { rotate: `${angle + Math.PI / 2}rad` },
        { scaleY: interpolate(travel.value, [0, 1], [0.1, 4], 'clamp') * interpolate(warp, [0, 1], [1, 50], 'clamp') }
      ],
      opacity: interpolate(travel.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0], 'clamp'),
      width: interpolate(warp, [0, 1], [2, 1.2], 'clamp'),
      height: 40,
    };
  });
  return <Animated.View style={[{ position: 'absolute', backgroundColor: STAR_COLOR, borderRadius: 1 }, starStyle]} />;
};

export default function QuestionAnswerScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileId, setProfileId] = useState<string>('');

  const currentQuestion = questions[currentIndex];

  // データ読み込み
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const [questionsStr, answersStr, indexStr, profId] = await AsyncStorage.multiGet([
        'current_questions',
        'current_answers',
        'current_question_index',
        'profile_id',
      ]);

      const loadedQuestions = questionsStr[1] ? JSON.parse(questionsStr[1]) : [];
      const loadedAnswers = answersStr[1] ? JSON.parse(answersStr[1]) : [];
      const loadedIndex = indexStr[1] ? parseInt(indexStr[1], 10) : 0;
      const loadedProfileId = profId[1] || '';

      setQuestions(loadedQuestions);
      setAnswers(loadedAnswers);
      setCurrentIndex(loadedIndex);
      setProfileId(loadedProfileId);
    } catch (e) {
      console.error('Failed to load questions:', e);
      router.back();
    }
  };

  // UI共有値
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const warpFactor = useSharedValue(0);
  const whiteoutOpacity = useSharedValue(0);

  // インパクト共有値
  const ringScale = useSharedValue(0.5);
  const ringOpacity = useSharedValue(0);
  const swipeDirection = useSharedValue(0);
  const impactIntensity = useSharedValue(0);

  // 🚀 スコア用
  const [displayScore, setDisplayScore] = useState(0);
  const scoreOpacity = useSharedValue(0);
  const scoreTranslateY = useSharedValue(0);

  const stars = useMemo(() => Array.from({ length: 70 }), []);

  const triggerImpact = (velocity: number, direction: 'YES' | 'NO') => {
    const speed = Math.abs(velocity);
    const intensity = interpolate(speed, [500, 4500], [0.4, 1.0], 'clamp');
    impactIntensity.value = intensity;
    swipeDirection.value = direction === 'YES' ? 1 : -1;

    // 🚀 1-100 スコア計算
    const score = Math.round(interpolate(speed, [0, 5000], [1, 100], 'clamp'));
    runOnJS(setDisplayScore)(score);

    // スコア表示演出
    scoreTranslateY.value = 0;
    scoreOpacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withDelay(700, withTiming(0, { duration: 300 }))
    );
    scoreTranslateY.value = withTiming(-30, { duration: 1000, easing: Easing.out(Easing.quad) });

    // リング演出
    ringScale.value = 0.5;
    ringOpacity.value = 1;
    const targetScale = interpolate(intensity, [0.4, 1.0], [2, 5]);
    const duration = interpolate(intensity, [0.4, 1.0], [600, 300]);
    ringScale.value = withTiming(targetScale, { duration, easing: Easing.out(Easing.exp) });
    ringOpacity.value = withTiming(0, { duration });
  };

  const onAnswerComplete = async (answer: 'YES' | 'NO' | 'UNKNOWN', velocity: number) => {
    if (answer !== 'UNKNOWN') triggerImpact(velocity, answer);
    if (!currentQuestion) return;

    try {
      // スワイプ値を計算（速度から0-100へ）
      const speed = Math.abs(velocity);
      const swipeValue = Math.round(interpolate(speed, [0, 5000], [1, 100], 'clamp'));

      // 回答を作成
      const newAnswer: QuestionAnswer = {
        question_id: currentQuestion.id, // number型のまま保存
        question_text: currentQuestion.text, // question_textも保存
        direction: answer === 'YES' ? 'yes' : 'no',
        swipe_value: swipeValue,
      };

      // デバッグ用：回答内容を出力
      console.log('Answer saved:', {
        question_id: newAnswer.question_id,
        question_text: newAnswer.question_text,
        direction: newAnswer.direction,
        swipe_value: newAnswer.swipe_value,
      });

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      // AsyncStorageに保存
      await AsyncStorage.setItem('current_answers', JSON.stringify(updatedAnswers));
      await AsyncStorage.setItem('current_question_index', String(currentIndex + 1));

      // 回答済みIDを記録
      await addAnsweredQuestionId(profileId, currentQuestion.id);

      translateX.value = 0;
      rotate.value = 0;

      // 最後の質問か？
      if (currentIndex === questions.length - 1) {
        warpFactor.value = withTiming(1, { duration: 800 });
        whiteoutOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
        setTimeout(() => {
          router.replace('/question/complete');
        }, 1000);
      } else {
        // 次の質問へ
        setCurrentIndex(currentIndex + 1);
      }
    } catch (e) {
      console.error('Failed to save answer:', e);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (warpFactor.value > 0) return;
      translateX.value = event.translationX;
      rotate.value = interpolate(event.translationX, [-width / 2, width / 2], [-8, 8], 'clamp');
    })
    .onEnd((event) => {
      if (warpFactor.value > 0) return;
      const vX = event.velocityX;
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width, { velocity: vX }, () => runOnJS(onAnswerComplete)('YES', vX));
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width, { velocity: vX }, () => runOnJS(onAnswerComplete)('NO', vX));
      } else { translateX.value = withSpring(0); rotate.value = withSpring(0); }
    });

  // 🚀 多層ネオンリングスタイル
  const baseColor = useDerivedValue(() => interpolateColor(swipeDirection.value, [-1, 0, 1], [COLOR_NO, '#FFFFFF00', COLOR_YES]));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }], opacity: ringOpacity.value,
    borderColor: '#FFF', borderWidth: 2, shadowColor: baseColor.value, shadowRadius: 10, shadowOpacity: 1, zIndex: 10,
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }], opacity: ringOpacity.value * 0.8,
    borderColor: baseColor.value, borderWidth: interpolate(impactIntensity.value, [0.4, 1], [4, 15]),
    shadowColor: baseColor.value, shadowRadius: 40, shadowOpacity: 1, zIndex: 5,
  }));

  // 🚀 スコアテキストスタイル
  const scoreWrapperStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ translateY: scoreTranslateY.value }, { scale: interpolate(scoreOpacity.value, [0, 1], [0.8, 1.2], 'clamp') }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={styles.starField} pointerEvents="none">{stars.map((_, i) => <Star key={i} warpFactor={warpFactor} />)}</View>

        {/* 🚀 ネオンリング */}
        <View style={styles.centerFixed} pointerEvents="none">
          <Animated.View style={[styles.neonRing, glowStyle]} />
          <Animated.View style={[styles.neonRing, coreStyle]} />
        </View>

        {/* 🚀 スコア表示 */}
        <View style={styles.scoreContainer} pointerEvents="none">
          <Animated.View style={scoreWrapperStyle}>
            <Text style={styles.scoreLabel}>SYNC STRENGTH</Text>
            <Text style={[styles.scoreValue, { color: displayScore > 80 ? '#FFF' : '#AAA' }]}>{displayScore}</Text>
          </Animated.View>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerText}>{`PROTOCOL: ${currentIndex + 1}/${questions.length}`}</Text>
        </View>

        <View className="flex-1 justify-center items-center">
          <GestureDetector gesture={gesture}>
            <Animated.View style={[useAnimatedStyle(() => ({
              transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }, { scale: interpolate(warpFactor.value, [0, 0.4], [1, 0], 'clamp') }],
              borderColor: interpolateColor(translateX.value, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [COLOR_NO, '#2A2A2A', COLOR_YES]),
              backgroundColor: interpolateColor(translateX.value, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [`${COLOR_NO}45`, '#111', `${COLOR_YES}45`]),
            })), styles.card]} className="px-6 rounded-[24px] items-center justify-center border-2 shadow-2xl">
              <Text className="text-base font-bold text-white text-center leading-6">{currentQuestion?.text || ""}</Text>
            </Animated.View>
          </GestureDetector>
        </View>

        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF', opacity: whiteoutOpacity }]} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, alignItems: 'center' },
  headerText: { color: '#333', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },
  card: { width: width * 0.7, height: 220 },
  starField: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  centerFixed: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  neonRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'transparent' },
  scoreContainer: { position: 'absolute', top: height * 0.15, width: '100%', alignItems: 'center', zIndex: 100 },
  scoreLabel: { color: '#444', fontSize: 10, fontFamily: 'monospace', letterSpacing: 3 },
  scoreValue: { fontSize: 64, fontWeight: '900', fontFamily: 'monospace' },
});