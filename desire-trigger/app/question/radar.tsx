import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, G, Defs, RadialGradient, Stop, Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarryBackground from '../../components/ui/StarryBackground';
import { ParameterScores } from '../../types';

const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const SPACE_BG = '#020617';
const RADAR_THEME = '#00E5FF';
const RADAR_GRID = 'rgba(255, 255, 255, 0.1)';
const POLYGON_FILL = 'rgba(255, 255, 255, 0.05)';

// 五角形の頂点計算
const getVertex = (radius: number, index: number) => {
  'worklet';
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  return { x: 200 + radius * Math.cos(angle), y: 200 + radius * Math.sin(angle) };
};

export default function RadarScreen() {
  const router = useRouter();
  const [scores, setScores] = useState<ParameterScores | null>(null);

  // --- アニメーション用の共有値 ---
  const lineDrawProgress = useSharedValue(0);
  const fillOpacity = useSharedValue(0);
  const isExiting = useSharedValue(0);
  
  // 5つの星（✨）それぞれのスケール用
  const starScale0 = useSharedValue(0.001);
  const starScale1 = useSharedValue(0.001);
  const starScale2 = useSharedValue(0.001);
  const starScale3 = useSharedValue(0.001);
  const starScale4 = useSharedValue(0.001);
  const starScales = [starScale0, starScale1, starScale2, starScale3, starScale4];

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const scoresStr = await AsyncStorage.getItem('current_scores');
      if (scoresStr) {
        setScores(JSON.parse(scoresStr));
      }
    } catch (e) {
      console.error('Failed to load scores:', e);
    }
  };

  const chartData = scores ? [
    { label: '探索', score: scores.exploration },
    { label: '没頭', score: scores.immersion },
    { label: '整理', score: scores.organization },
    { label: '貢献', score: scores.contribution },
    { label: '元気', score: scores.vitality }
  ] : [
    { label: '探索', score: 70 },
    { label: '没頭', score: 90 },
    { label: '整理', score: 50 },
    { label: '貢献', score: 40 },
    { label: '元気', score: 85 }
  ];

  // パス（線）の合計長さを計算して、描画アニメーションの長さを決める
  const totalPerimeter = useMemo(() => {
    return chartData.reduce((acc, d, i) => {
      const nextD = chartData[(i + 1) % 5];
      const p1 = getVertex(145 * (d.score / 100), i);
      const p2 = getVertex(145 * (nextD.score / 100), (i + 1) % 5);
      return acc + Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }, 0);
  }, [chartData]);

  useEffect(() => {
    // --- Phase 1: 星が順番に右回りでバウンド出現 ---
    const STAR_DELAY = 400; // 星と星の出現間隔（ミリ秒）
    const INITIAL_DELAY = 500; // 画面が開いてからの最初の待機時間

    chartData.forEach((_, i) => {
      starScales[i].value = withDelay(
        INITIAL_DELAY + i * STAR_DELAY,
        withSpring(1.5, { damping: 4, stiffness: 100 }) // ポヨンと弾ける設定
      );
    });

    // --- Phase 2: すべての星が出揃ったら、線が星を繋いでいく ---
    const LINE_START_DELAY = INITIAL_DELAY + chartData.length * STAR_DELAY + 200;
    const LINE_DURATION = 3000; // 3秒かけてじっくり線を引く

    lineDrawProgress.value = withDelay(
      LINE_START_DELAY,
      withTiming(1, { duration: LINE_DURATION, easing: Easing.inOut(Easing.cubic) }, () => {
        // --- Phase 3: 線が繋がりきったら、中の背景色をフワッと表示 ---
        fillOpacity.value = withTiming(1, { duration: 800 });
      })
    );
  }, []);

  // ポリゴンの線と塗りのアニメーション設定
  const polygonProps = useAnimatedProps(() => {
    const points = chartData.map((d, i) => {
      const p = getVertex(145 * (d.score / 100), i);
      return i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`;
    }).join(' ') + ' Z'; // 最後をZで閉じて図形にする

    // 0から1へ進むにつれて、dashoffsetを減らして線を伸ばす
    const strokeDashoffset = interpolate(lineDrawProgress.value, [0, 1], [totalPerimeter, 0]);

    return {
      d: points,
      stroke: "#FFFFFF",
      strokeWidth: 2,
      strokeDasharray: totalPerimeter,
      strokeDashoffset,
      fill: POLYGON_FILL,
      fillOpacity: fillOpacity.value, // 線が引き終わるまでは透明
    };
  });

  const handleNext = () => {
    // 1. 退出アニメーションのフラグを立てる（これで星が移動を開始）
    isExiting.value = withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) });
    
    // 2. 背景の塗りつぶしや線をスッと消す
    fillOpacity.value = withTiming(0, { duration: 300 });
    lineDrawProgress.value = withTiming(0, { duration: 300 });

    // 3. アニメーションが終わる頃（約600ms後）に画面遷移を実行
    setTimeout(() => {
      router.push('/question/tasks');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <StarryBackground />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SYSTEM ANALYSIS</Text>
        </View>

        <View style={styles.displayArea}>
          <View style={styles.chartContainer}>
            <Svg height="500" width="400" viewBox="0 0 400 500">
              <Defs>
                <RadialGradient id="vertexGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              <G>
                {/* 背景のクモの巣グリッド */}
                {[150, 100, 50].map(r => (
                  <Polygon
                    key={`grid-${r}`}
                    points={[0, 1, 2, 3, 4].map(i => {
                      const p = getVertex(r, i);
                      return `${p.x},${p.y}`;
                    }).join(' ')}
                    stroke={RADAR_GRID}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    fill="transparent"
                  />
                ))}

                {/* 星を繋ぐアニメーション線 */}
                <AnimatedPath animatedProps={polygonProps} strokeLinejoin="round" />

                {/* 順番にバウンドして出現する星（✨） */}
                {chartData.map((d, i) => {
                  const p = getVertex(145 * (d.score / 100), i);
                  
                  // 💡 退出時に星が向かうターゲット座標（カードが配置されるおおよそのY座標）
                  // 5つの星を、上(0)・中(1)・下(2)のカード位置に割り振る
                  const targetYOffsets = [-130, -130, 0, 130, 130]; 
                  const targetX = 200; // 中央
                  const targetY = 200 + targetYOffsets[i]; 

                  const animatedScale = useAnimatedProps(() => {
                    // 退出時は星を縮小させて消す
                    const exitScale = interpolate(isExiting.value, [0, 0.8, 1], [1, 1.5, 0]);
                    
                    // 現在位置からターゲット位置への移動
                    const currentX = interpolate(isExiting.value, [0, 1], [p.x, targetX]);
                    const currentY = interpolate(isExiting.value, [0, 1], [p.y, targetY]);

                    return {
                      transform: [
                        { translateX: currentX },
                        { translateY: currentY },
                        { scale: starScales[i].value * exitScale }
                      ]
                    } as any;
                  });

                  return (
                    <G key={`star-${i}`}>
                      <AnimatedG animatedProps={animatedScale}>
                        <Circle r="20" cx="0" cy="0" fill="url(#vertexGlow)" opacity={0.6} />
                        <Path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z" fill="#FFFFFF" />
                      </AnimatedG>
                    </G>
                  );
                })}
              </G>
            </Svg>

            {/* パラメーターのラベルとスコア文字 */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {chartData.map((d, i) => {
                const rad = ((i * 360) / 5 - 90) * Math.PI / 180;
                const x = 200 + 175 * Math.cos(rad);
                const y = 200 + 175 * Math.sin(rad);
                return (
                  <View key={`label-${i}`} style={[styles.labelWrapper, { left: x - 40, top: y - 20 }]}>
                    <Text style={styles.labelText}>{d.label}</Text>
                    <Text style={styles.labelScore}>{Math.round(d.score)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleNext} style={styles.actionButton}>
            <Text style={styles.buttonText}>タスクを見る →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SPACE_BG },
  contentWrapper: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: RADAR_THEME, fontSize: 14, fontWeight: '900', letterSpacing: 5 },
  displayArea: { width: width, flex: 1, justifyContent: 'center', alignItems: 'center' },
  chartContainer: { position: 'absolute', top: 20, width: 400, height: 500, alignItems: 'center' },
  labelWrapper: { position: 'absolute', alignItems: 'center', width: 80 },
  labelText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  labelScore: { color: RADAR_THEME, fontSize: 16, fontWeight: '900', fontFamily: 'monospace' },
  footer: { width: '100%', alignItems: 'center', paddingBottom: 40, height: 120, justifyContent: 'center' },
  actionButton: { width: width * 0.7, paddingVertical: 18, borderRadius: 40, alignItems: 'center', backgroundColor: '#FFF' },
  buttonText: { fontWeight: '900', letterSpacing: 2, fontSize: 14, fontFamily: 'monospace', color: '#000' },
});