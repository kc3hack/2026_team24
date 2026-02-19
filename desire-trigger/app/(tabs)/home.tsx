// （ファイル全体 — 先ほど動いていたバージョンに finishTransition の遅延を追加しました）
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Canvas, Group, BlurMask, vec, Fill,
  matchFont, Text as SkiaText, Skia, Line, Circle
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue, withTiming, Easing, useDerivedValue, runOnJS, interpolate, useAnimatedStyle,
  type SharedValue
} from 'react-native-reanimated';
import { useMockStore } from '../../store/mockStore';

import GreetingHeader from '../../components/home/GreetingHeader';
import LaunchButton from '../../components/home/LaunchButton';

const { width, height } = Dimensions.get('window');
const CENTER = vec(width / 2, height / 2);

// カードサイズ（縁に沿って 0/1 を描く）
const CARD_W = width * 0.7;
const CARD_H = 220;
const CORNER_RADIUS = 24;
// カードの Y 位置を微調整したい場合はここを変更（正：下に移動、負：上に移動）
const CARD_Y_OFFSET = 10;

const TERMINAL_LOGS = Array.from({ length: 60 }).map((_, i) => {
  const codes = ["> FETCHING_DATA", "> ANALYZING_REPLY", "> NEURAL_CALC", "> ADAPTING_LOGIC", "> SYNC_DESIRE"];
  return `${codes[i % codes.length]}_${Math.random().toString(36).substring(2, 7).toUpperCase()}... [DONE]`;
});

const FONT_SIZE = 11;
const LINE_HEIGHT = FONT_SIZE * 1.3;

// -----------------------------
// TerminalLine コンポーネント
// -----------------------------
const TerminalLine = ({ index, text, font, visibleLines }: { index: number, text: string, font: any, visibleLines: SharedValue<number> }) => {
  const opacity = useDerivedValue(() => (index < visibleLines.value ? 0.5 : 0));
  return <SkiaText x={20} y={index * LINE_HEIGHT} text={text} font={font} color="#00E5FF" opacity={opacity} />;
};

// -----------------------------
// BorderChar コンポーネント
// -----------------------------
const BorderChar = ({ index, pos, char, font, visibleCount }: { index: number, pos: { x: number, y: number }, char: string, font: any, visibleCount: SharedValue<number> }) => {
  const opacity = useDerivedValue(() => (index < visibleCount.value ? 1 : 0));
  return (
    <Group opacity={opacity}>
      <SkiaText x={pos.x - FONT_SIZE / 2} y={pos.y + FONT_SIZE / 2} text={char} font={font} color="#00E5FF" />
    </Group>
  );
};

// -----------------------------
// UltimateTransition（改善版：遷移を遅延してチラつきを防止）
// -----------------------------
function UltimateTransition({
  isLaunching,
  onComplete,
  origin // { x, y } in screen coordinates
}: { isLaunching: boolean; onComplete: () => void; origin: { x: number, y: number } }) {
  const router = useRouter();
  const { resetQuestions } = useMockStore();

  // Shared values for sequencing
  const circleRadius = useSharedValue(0); // ripple radius from origin
  const logProgress = useSharedValue(0);
  const borderProgress = useSharedValue(0);
  const whiteoutOpacity = useSharedValue(0);

  // フォント（日本語対応）
  const font = useMemo(() => matchFont({
    fontFamily: Platform.select({ ios: 'Hiragino Kaku Gothic ProN', android: 'sans-serif' }),
    fontSize: FONT_SIZE,
    fontWeight: '400',
  }), []);

  const largeFont = useMemo(() => matchFont({
    fontFamily: Platform.select({ ios: 'Hiragino Kaku Gothic ProN', android: 'sans-serif' }),
    fontSize: 28,
    fontWeight: '600',
  }), []);

  // derived values
  const visibleLines = useDerivedValue(() => Math.floor(logProgress.value * TERMINAL_LOGS.length));

  // スクロールの start/end（安定化）
  const startY = height * 0.85;
  const totalLogHeight = TERMINAL_LOGS.length * LINE_HEIGHT;
  const visibleArea = height * 0.4;
  const maxScroll = Math.max(0, totalLogHeight - visibleArea);
  const endY = startY - maxScroll;

  const logScrollY = useDerivedValue(() => interpolate(logProgress.value, [0, 1], [startY, endY]));
  const totalOpacity = useDerivedValue(() => interpolate(whiteoutOpacity.value, [0, 0.4], [1, 0]));
  const groupTransform = useDerivedValue(() => [{ translateY: logScrollY.value }]);
  const whiteoutAnimatedStyle = useAnimatedStyle(() => ({ opacity: whiteoutOpacity.value }));

  // Skia でカード輪郭（Path）
  const cardPath = useMemo(() => {
    const p = Skia.Path.Make();
    const cardX = (width - CARD_W) / 2;
    const cardY = (height - CARD_H) / 2 + CARD_Y_OFFSET;
    const r = Skia.XYWHRect(cardX, cardY, CARD_W, CARD_H);
    p.addRRect(Skia.RRectXY(r, CORNER_RADIUS, CORNER_RADIUS));
    return p;
  }, []);

  const contourMeasure = useMemo(() => {
    try {
      const iter = Skia.ContourMeasureIter(cardPath, false, 1);
      return iter.next();
    } catch (e) {
      return null;
    }
  }, [cardPath]);

  const pathLength = contourMeasure ? contourMeasure.length() : 0;
  const numBorderChars = Math.max(8, Math.floor(pathLength / (FONT_SIZE * 0.8)));
  const visibleCount = useDerivedValue(() => Math.floor(borderProgress.value * numBorderChars));

  const borderPositions = useMemo(() => {
    const arr: { x: number, y: number }[] = [];
    if (!contourMeasure) return arr;
    for (let i = 0; i < numBorderChars; i++) {
      const charProgress = i / numBorderChars;
      const dist = charProgress * pathLength;
      const posTan = contourMeasure.getPosTan(dist);
      if (!posTan) arr.push({ x: 0, y: 0 });
      else arr.push({ x: posTan[0].x, y: posTan[0].y });
    }
    return arr;
  }, [contourMeasure, numBorderChars, pathLength]);

  const calcMaxRadius = (ox: number, oy: number) => {
    const dx = Math.max(ox, width - ox);
    const dy = Math.max(oy, height - oy);
    return Math.hypot(dx, dy) * 1.4;
  };

  // --- 追加: finishTransition を定義（runOnJS で呼ぶ）
  const finishTransition = useCallback(() => {
    // この関数は runOnJS から呼ばれるので JS スレッドで実行される
    // 1) reset app state
    try { resetQuestions(); } catch (e) { /* ignore */ }
    // 2) 画面遷移（push）
    router.push('/question/answer');
    // 3) すぐに isLaunching を false にしてアンマウントするとチラつくので少し待つ
    //    300ms 後に onComplete を呼び、UltimateTransition をアンマウントする
    setTimeout(() => {
      try { onComplete(); } catch (e) { /* ignore */ }
    }, 300);
  }, [router, resetQuestions, onComplete]);

  useEffect(() => {
    if (isLaunching) {
      // ripple
      const maxR = calcMaxRadius(origin.x, origin.y);
      circleRadius.value = withTiming(maxR, { duration: 900, easing: Easing.out(Easing.exp) });

      // after ripple, start log
      setTimeout(() => {
        logProgress.value = withTiming(1, { duration: 3500, easing: Easing.linear });
      }, 950);

      // start border later
      setTimeout(() => {
        borderProgress.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.exp) });
      }, 2100);

      // finally whiteout -> call finishTransition via runOnJS
      setTimeout(() => {
        // animate whiteout to fully opaque, then call finishTransition
        whiteoutOpacity.value = withTiming(1, { duration: 600 }, () => {
          // call finishTransition on JS thread; don't call onComplete immediately
          runOnJS(finishTransition)();
        });
      }, 3500);
    } else {
      circleRadius.value = 0;
      logProgress.value = 0;
      borderProgress.value = 0;
      whiteoutOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLaunching, origin.x, origin.y, finishTransition]);

  const largeTextY = height * 0.20;

  if (!isLaunching || !font || !largeFont) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={{ flex: 1 }}>
        {/* Ripple circle (filled + blurred) */}
        <Group>
          <Circle cx={origin.x} cy={origin.y} r={circleRadius}>
            <Fill color="rgba(0,229,255,0.28)" />
            <BlurMask blur={14} style="solid" />
          </Circle>
        </Group>

        {/* 上部テキスト */}
        <Group opacity={totalOpacity}>
          <SkiaText x={(width - 260) / 2} y={largeTextY} text="質問を生成しています" font={largeFont} color="#00E5FF" />
          <BlurMask blur={5} style="solid" />
        </Group>

        {/* ログスクロール */}
        <Group opacity={totalOpacity} transform={groupTransform}>
          {TERMINAL_LOGS.map((text, i) => (
            <TerminalLine key={i} index={i} text={text} font={font} visibleLines={visibleLines} />
          ))}
        </Group>

        {/* カード輪郭（0/1） */}
        <Group opacity={totalOpacity}>
          {borderPositions.map((pos, i) => {
            const char = i % 2 === 0 ? '0' : '1';
            return <BorderChar key={i} index={i} pos={pos} char={char} font={font} visibleCount={visibleCount} />;
          })}
        </Group>

        {/* 中央の控えめな爆発（whiteout の前景効果） */}
        <Group opacity={totalOpacity}>
          <Circle cx={CENTER.x} cy={CENTER.y} r={interpolate(whiteoutOpacity.value, [0, 1], [0, width * 1.1])}>
            <BlurMask blur={18} style="solid" />
          </Circle>
        </Group>
      </Canvas>

      {/* whiteout（完全不透明まで保ってから遷移し、遅延でアンマウント） */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF' }, whiteoutAnimatedStyle]} pointerEvents="none" />
    </View>
  );
}

// -----------------------------
// HomeScreen（LaunchButton の onPress で実測中心を取得して origin をセット）
// -----------------------------
export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [origin, setOrigin] = useState<{ x: number, y: number }>({ x: CENTER.x, y: CENTER.y });
  const [userName, setUserName] = useState<string>('...');
  const [hasDiagnosedToday, setHasDiagnosedToday] = useState(false);

  const buttonWrapperRef = useRef<any>(null);

  const uiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isLaunching ? 0.3 : 1, { duration: 400 }),
  }));

  useFocusEffect(useCallback(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const name = await AsyncStorage.getItem('userName'); if (name) setUserName(name);
        const lastDate = await AsyncStorage.getItem('lastDiagnosedDate');
        if (lastDate) {
          const today = new Date(); today.setHours(0,0,0,0);
          const last = new Date(lastDate); last.setHours(0,0,0,0);
          setHasDiagnosedToday(today.getTime() === last.getTime());
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    loadData();
  }, []));

  // ボタンが押されたときに wrapper の画面上位置を取得して origin をセット、起動する
  const handleLaunchPress = useCallback(() => {
    if (buttonWrapperRef.current && typeof buttonWrapperRef.current.measureInWindow === 'function') {
      buttonWrapperRef.current.measureInWindow((mx: number, my: number, mw: number, mh: number) => {
        setOrigin({ x: mx + mw / 2, y: my + mh / 2 });
        setTimeout(() => setIsLaunching(true), 8);
      });
    } else {
      setOrigin({ x: CENTER.x, y: CENTER.y });
      setTimeout(() => setIsLaunching(true), 8);
    }
  }, [buttonWrapperRef]);

  if (loading) return <View style={[styles.center, styles.root]}><ActivityIndicator size="large" color="#00E5FF" /></View>;

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, uiAnimatedStyle]}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <GreetingHeader userName={userName} onSettingsPress={() => { }} onLongPress={() => { }} />

            <View style={{ marginVertical: 40, alignItems: 'center' }} ref={buttonWrapperRef}>
              <LaunchButton isDiagnosed={hasDiagnosedToday} onPress={handleLaunchPress} showTooltip={false} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      <UltimateTransition isLaunching={isLaunching} onComplete={() => setIsLaunching(false)} origin={origin} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
});