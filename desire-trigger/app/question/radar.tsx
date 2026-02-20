import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, G, Defs, RadialGradient, Stop, Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
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

  const chartEnter = useSharedValue(0);
  const lineDrawProgress = useSharedValue(0);

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

  useEffect(() => {
    // レーダーチャートのアニメーション（2〜3秒）
    chartEnter.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.exp) });
    lineDrawProgress.value = withDelay(600, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
  }, []);

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

  const polygonProps = useAnimatedProps(() => {
    const points = chartData.map((d, i) => {
      const p = getVertex(145 * (d.score / 100) * chartEnter.value, i);
      return i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`;
    }).join(' ');

    const strokeDashoffset = interpolate(lineDrawProgress.value, [0, 1], [2000, 0]);

    return {
      d: `${points}Z`,
      stroke: "#FFFFFF",
      strokeWidth: 1,
      strokeDasharray: 2000,
      strokeDashoffset,
    };
  });

  const handleNext = () => {
    router.push('/question/tasks');
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
                <AnimatedPath animatedProps={polygonProps} fill={POLYGON_FILL} strokeLinejoin="round" />

                {chartData.map((d, i) => {
                  const p = getVertex(145 * (d.score / 100), i);
                  return (
                    <G key={`vertex-${i}`}>
                      <Circle cx={p.x} cy={p.y} r="20" fill="url(#vertexGlow)" opacity={0.6} />
                      <Circle cx={p.x} cy={p.y} r="8" fill="#FFFFFF" />
                    </G>
                  );
                })}
              </G>
            </Svg>

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
