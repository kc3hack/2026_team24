import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

// 共通の背景コンポーネント
import StarryBackground from '../../components/ui/StarryBackground';

const { width, height } = Dimensions.get('window');

// ワープエフェクト用の星の数
const NUM_STARS = 150;
// ワープ線の色（青白色）
const WARP_COLOR = '#82E9E9';
// サイバーUIの色（参考画像の鮮やかな青）
const CYBER_BLUE = '#00e5ff';

const warpStars = Array.from({ length: NUM_STARS }).map((_, i) => {
  const angle = Math.random() * Math.PI * 2;
  // 中心付近から発生させて奥行き感を出す
  const radius = Math.random() * (width / 8); 
  return {
    id: i,
    angle,
    startX: Math.cos(angle) * radius,
    startY: Math.sin(angle) * radius,
    // 星によって線の長さやタイミングをランダムに変える
    speedFactor: 0.8 + Math.random() * 1.2,
    lengthFactor: 1.0 + Math.random() * 2.5, // 長さのばらつきを大きく
  };
});

export default function TransitionHomeScreen() {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);

  // --- アニメーション用の共有値 ---
  // レバー用
  const leverEntryY = useSharedValue(300); // 初期位置は画面外（下）
  const leverY = useSharedValue(0);        // レバーの引き具合 (0 ~ 150)

  // ワープ用
  const warpProgress = useSharedValue(0); // 0:静止 -> 1:最高速
  const whiteoutOpacity = useSharedValue(0);

  // サイバー指示UI用 (0:非表示, 1:表示)
  const instructionOpacity = useSharedValue(0);

  // ハプティクス
  const triggerHapticTick = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const triggerHapticMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const triggerHapticHeavy = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  useEffect(() => {
    // 画面が表示されたら、少し間をおいてレバーが出現
    triggerHapticMedium();
    leverEntryY.value = withDelay(300, withSpring(0, { damping: 12, stiffness: 90 }));
    
    // レバーが上がりきる頃（800ミリ秒後）に、確実に文字UIを表示させる
    instructionOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);

  // --- ワープ実行関数 ---
  const executeWarp = () => {
    setIsWarping(true);
    // 重い振動でワープ開始を伝える
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // 星が線になり外側に伸びる（スター・ウォーズの加速）
    // durationを少し短くしてスピード感をアップ
    warpProgress.value = withTiming(1, { duration: 1200, easing: Easing.in(Easing.poly(4)) }, () => {
      // 完了時のフィードバック
      runOnJS(triggerHapticHeavy)();
      // ホワイトアウト
      whiteoutOpacity.value = withTiming(1, { duration: 400 }, () => {
        // 次の画面へ遷移
        runOnJS(router.replace)('/question/answer' as any);
      });
    });
  };

  // --- レバーのドラッグ操作 ---
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = Math.max(0, Math.min(event.translationY, 150));
      leverY.value = newY;
      
      // レバーを少しでも動かしたら、指示UIを消滅させる
      if (newY > 20 && instructionOpacity.value > 0) {
        instructionOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
      }

      // 引いている間、細かい振動を発生させる
      runOnJS(triggerHapticTick)();
    })
    .onEnd(() => {
      // 一定以上(100px)引いたらワープ発動
      if (leverY.value > 100 && !isWarping) {
        leverY.value = withSpring(150); // 一番下までガチャンと落とす
        runOnJS(executeWarp)();
      } else if (!isWarping) {
        // 引く量が足りなければバネで戻る
        leverY.value = withSpring(0);
        // 指示UIを再表示
        instructionOpacity.value = withTiming(1, { duration: 400 });
      }
    });

  // --- Animated Styles ---
  const leverContainerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: leverEntryY.value }] }));
  const leverHandleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: leverY.value }] }));
  
  // ワープ開始と共に背景を少し暗くしてコントラストを上げる
  const staticBackgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(warpProgress.value, [0, 0.5], [1, 0.3], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(warpProgress.value, [0, 1], [1, 1.2]) }]
  }));

  const whiteoutStyle = useAnimatedStyle(() => ({ opacity: whiteoutOpacity.value }));

  return (
    <GestureHandlerRootView style={styles.container}>
      
      {/* --- 1. 静止した背景 --- */}
      <Animated.View style={[StyleSheet.absoluteFillObject, staticBackgroundStyle]}>
        <StarryBackground />
      </Animated.View>

      {/* --- 2. ワープ専用の星（青い光の線） --- */}
      {/* レバーを引く前は隠しておき、ワープ開始と共に出現させる */}
      <View style={[styles.warpCenter, { opacity: isWarping ? 1 : 0 }]}>
        {warpStars.map((star) => (
          <WarpStar key={`star-${star.id}`} star={star} progress={warpProgress} />
        ))}
      </View>

      {/* --- 3. サイバー指示UI --- */}
      <CyberInstructionUI visible={instructionOpacity} />

      {/* --- 4. コックピットのレバー --- */}
      <Animated.View style={[styles.cockpitContainer, leverContainerStyle]}>
        <View style={styles.leverRail}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.leverHandleWrapper, leverHandleStyle]}>
              {/* レバーのデザインを少しSFチックに強化 */}
              <View style={styles.leverKnobAccent} />
              <View style={styles.leverKnob} />
              <View style={styles.leverStick} />
            </Animated.View>
          </GestureDetector>
        </View>
        {/* テキストも発光色に */}
        <Text style={[styles.leverInstruction, { color: WARP_COLOR, textShadowColor: WARP_COLOR }]}>PULL TO WARP</Text>
      </Animated.View>

      {/* --- 5. ホワイトアウト --- */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.whiteout, whiteoutStyle]} pointerEvents="none" />
      
    </GestureHandlerRootView>
  );
}

// 星が線になるアニメーションコンポーネント
function WarpStar({ star, progress }: { star: any, progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    // 進行度に応じて、中心から外側へ加速しながら移動し、強烈に引き伸ばす
    
    // 線の長さ：後半に指数関数的に急激に長くなる (最大スケールを大幅にアップ)
    const scaleX = interpolate(
      progress.value,
      [0, 0.2, 1],
      [0, 10 * star.lengthFactor, 400 * star.lengthFactor], // 最大400倍まで引き伸ばす
      Extrapolation.CLAMP
    );
    
    // 移動距離：画面外のはるか彼方までカッ飛ぶ
    const moveDistance = interpolate(
      progress.value,
      [0, 1],
      [0, width * 2.5 * star.speedFactor],
      Extrapolation.CLAMP
    );
    const translateX = star.startX + moveDistance * Math.cos(star.angle);
    const translateY = star.startY + moveDistance * Math.sin(star.angle);
    
    // 透明度：最初と最後は消える
    const opacity = interpolate(progress.value, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${star.angle}rad` }, // 進行方向に向ける
        { scaleX },
      ],
    };
  });
  // 線の色を青白く発光させるスタイルを適用
  return <Animated.View style={[styles.warpStarLine, style]} />;
}

// サイバーパンク風の指示UIコンポーネント
function CyberInstructionUI({ visible }: { visible: SharedValue<number> }) {
  const containerStyle = useAnimatedStyle(() => {
    // タブが開くように、横幅と透明度をアニメーション
    const scaleX = interpolate(visible.value, [0, 1], [0.3, 1], Extrapolation.CLAMP);
    const opacity = interpolate(visible.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scaleX }],
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(visible.value, [0.5, 1], [0, 1], Extrapolation.CLAMP), // 枠が出てからテキストを表示
    transform: [{ scale: interpolate(visible.value, [0.5, 1], [0.8, 1], Extrapolation.CLAMP) }]
  }));

  return (
    <Animated.View style={[styles.cyberUIContainer, containerStyle]} pointerEvents="none">
      {/* サイバーフレームの装飾 */}
      <View style={styles.cyberFrameLeft} />
      <View style={styles.cyberFrameRight} />
      <View style={styles.cyberLineTop} />
      <View style={styles.cyberLineBottom} />
      
      {/* 発光するテキスト */}
      <Animated.Text style={[styles.cyberText, textStyle]}>レバーを下げて</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  
  // --- ワープエフェクト ---
  warpCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  warpStarLine: {
    position: 'absolute',
    width: 3, // 少し細くして鋭さを出す
    height: 2,
    backgroundColor: WARP_COLOR, // 指定の青色
    borderRadius: 1,
    // 強烈な発光効果（ブルーム）
    shadowColor: WARP_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12, // 半径を広げて光を拡散
  },

  // --- サイバー指示UI ---
  cyberUIContainer: {
    position: 'absolute',
    top: height * 0.35, // 画面中央より少し上
    alignSelf: 'center',
    width: width * 0.7,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  cyberText: {
    color: CYBER_BLUE,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: CYBER_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  // フレーム装飾（参考画像のイメージ）
  cyberFrameLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, borderLeftWidth: 2, borderTopWidth: 2, borderBottomWidth: 2, borderColor: CYBER_BLUE, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  cyberFrameRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, borderRightWidth: 2, borderTopWidth: 2, borderBottomWidth: 2, borderColor: CYBER_BLUE, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  cyberLineTop: { position: 'absolute', top: 0, left: 15, right: 15, height: 2, backgroundColor: CYBER_BLUE, shadowColor: CYBER_BLUE, shadowOpacity: 1, shadowRadius: 5 },
  cyberLineBottom: { position: 'absolute', bottom: 0, left: 15, right: 15, height: 2, backgroundColor: CYBER_BLUE, shadowColor: CYBER_BLUE, shadowOpacity: 1, shadowRadius: 5 },

  // --- コックピットレバー ---
  cockpitContainer: { position: 'absolute', bottom: 80, alignSelf: 'center', alignItems: 'center', zIndex: 10 },
  leverRail: { 
    width: 36, height: 220, 
    backgroundColor: '#0F172A', 
    borderRadius: 18, 
    borderWidth: 2, borderColor: '#334155', 
    alignItems: 'center', 
    shadowColor: WARP_COLOR, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15,
  },
  leverHandleWrapper: { position: 'absolute', top: -20, alignItems: 'center', justifyContent: 'center' },
  leverKnob: { 
    width: 70, height: 45, 
    backgroundColor: '#EF4444',
    borderRadius: 12, borderWidth: 2, borderColor: '#7F1D1D', 
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5,
    zIndex: 2,
  },
  leverKnobAccent: {
    position: 'absolute', top: 5, width: 50, height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, zIndex: 3,
  },
  leverStick: { width: 14, height: 50, backgroundColor: '#64748B', marginTop: -5, zIndex: 1 },
  leverInstruction: { 
    fontSize: 12, fontWeight: '900', letterSpacing: 3, marginTop: 20, 
    textShadowOffset: {width: 0, height: 0}, textShadowRadius: 10,
  },

  whiteout: { backgroundColor: '#FFFFFF', zIndex: 100 },
});