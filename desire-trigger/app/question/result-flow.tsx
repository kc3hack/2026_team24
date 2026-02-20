import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 🚀 Line を追加
import Svg, { Polygon, G, Defs, RadialGradient, Stop, Path, Circle, Rect, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  SharedValue,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StarryBackground from '../../components/ui/StarryBackground';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);


let KC3_LOGO_IMG;
try {
  KC3_LOGO_IMG = require('../../assets/images/KC3.jpg');
} catch (e) {
  KC3_LOGO_IMG = null;
}

type Mission = { cat: string; title: string; color: string; };
type FlowPhase = 'analysis' | 'moving' | 'selecting' | 'filling' | 'completed';

// カテゴリごとの色マッピング
const CATEGORY_COLORS: Record<string, string> = {
  '探索系': '#FF00FF',
  '集中系': '#39FF14',
  '実行系': '#FFA500',
  '休息系': '#22D3EE',
};

// モックデータ（開発・デバッグ用に残す）
const MOCK_MISSIONS: Mission[] = [
  { cat: '没頭', title: '焼肉を食う', color: '#39FF14' },
  { cat: '元気', title: '高級焼肉を食う', color: '#22D3EE' },
  { cat: '探索', title: '高級焼肉を奢ってもらう', color: '#FF00FF' }
];

// DBTaskをMission形式に変換
const convertTaskToMission = (task: DBTask): Mission => {
  // カテゴリ名から「系」を除去（例: "探索系" → "探索"）
  const categoryLabel = task.category.replace('系', '');
  const color = CATEGORY_COLORS[task.category] || '#FFFFFF';

  return {
    cat: categoryLabel,
    title: task.title,
    color: color,
  };
};

const SPACE_BG = '#020617';
const RADAR_THEME = '#00E5FF';
const RADAR_GRID = 'rgba(255, 255, 255, 0.1)';
const POLYGON_FILL = 'rgba(255, 255, 255, 0.05)';

const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 110;
const CARD_GAP = 20;
const BASE_Y = 20
const CARD_Y_POSITIONS = [BASE_Y, BASE_Y + CARD_HEIGHT + CARD_GAP, BASE_Y + (CARD_HEIGHT + CARD_GAP) * 2];

// 五角形の頂点計算
const getVertex = (radius: number, index: number) => {
  'worklet';
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  return { x: 200 + radius * Math.cos(angle), y: 200 + radius * Math.sin(angle) };
};


// ✨ 星が直接カードの上下端へ飛んでいく
const StellarPoint = ({ x, y, index, moveProgress }: { x: number, y: number, index: number, moveProgress: SharedValue<number> }) => {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(index * 50, withSpring(1, { damping: 12, stiffness: 120 }));
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const p = moveProgress.value;
    const cardIndex = Math.floor(index / 2);
    const isTop = index % 2 === 0;

    const targetX = 200;
    const targetY = CARD_Y_POSITIONS[cardIndex] + (isTop ? 0 : CARD_HEIGHT);

    const currentX = interpolate(p, [0, 1], [x, targetX], 'clamp');
    const currentY = interpolate(p, [0, 1], [y, targetY], 'clamp');
    const currentScale = scale.value * interpolate(p, [0, 0.8, 1], [1, 1.3, 1], 'clamp');

    return {
      transform: [{ translateX: currentX }, { translateY: currentY }, { scale: currentScale }],
      opacity: interpolate(p, [0.8, 1], [1, 0], 'clamp')
    };
  });

  const sparklePath = "M 0 -14 C 0 -7, 7 0, 14 0 C 7 0, 0 7, 0 14 C 0 7, -7 0, -14 0 C -7 0, 0 -7, 0 -14 Z";
  return (
    <AnimatedG animatedProps={animatedProps}>
      <Circle cx={0} cy={0} r="20" fill="url(#vertexGlow)" opacity={0.6} />
      <Path d={sparklePath} fill="#FFF" />
    </AnimatedG>
  );
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabase/client';
import { getPreviousTitles, getTasksByDiagnosticId } from '../../supabase/tasks';
import { ParameterScores, DBTask } from '../../types';

export default function ResultFlowScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<FlowPhase>('analysis');
  const [scores, setScores] = useState<ParameterScores | null>(null);
  const [profileId, setProfileId] = useState('');
  const [diagnosticId, setDiagnosticId] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<Mission[] | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const [scoresStr, profId, diagId] = await AsyncStorage.multiGet([
        'current_scores',
        'profile_id',
        'current_diagnostic_id',
      ]);

      if (scoresStr[1]) {
        setScores(JSON.parse(scoresStr[1]));
      }
      setProfileId(profId[1] || '');
      setDiagnosticId(diagId[1] || '');
    } catch (e) {
      console.error('Failed to load scores:', e);
    }
  };

  const handleComplete = async () => {
    try {
      router.replace('/(tabs)');
    } catch (e) {
      console.error("Failed to navigate", e);
      router.replace('/(tabs)');
    }
  };


  const chartEnter = useSharedValue(0);
  const lineDrawProgress = useSharedValue(0); // 🚀 復活: チャートの線を描く

  const moveProgress = useSharedValue(0);
  const spinProgress = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const fillProgress = useSharedValue(0);

  const chartData = scores ? [
    { label: '探索', score: scores.exploration },
    { label: '没頭', score: scores.immersion },
    { label: '整理', score: scores.organization },
    { label: '貢献', score: scores.contribution },
    { label: '元気', score: scores.vitality }
  ] : [
    { label: '探索', score: 70 }, { label: '没頭', score: 90 }, { label: '整理', score: 50 },
    { label: '貢献', score: 40 }, { label: '元気', score: 85 }
  ];

  const missions = useMemo((): Mission[] => {
    // 生成されたタスクがある場合はそれを使う
    if (generatedTasks && generatedTasks.length > 0) {
      return generatedTasks;
    }
    // モックデータ（フォールバック）
    return MOCK_MISSIONS;
  }, [generatedTasks]);

  useEffect(() => {
    // 🚀 初期表示アニメーション（線が繋がる）
    chartEnter.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
    lineDrawProgress.value = withDelay(600, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));

    // 光の無限周回はバックグラウンドで走らせておく
    spinProgress.value = withRepeat(withTiming(1, { duration: 500, easing: Easing.linear }), -1, false);
  }, []);

  const handleStart = () => {
    setPhase('moving');
    moveProgress.value = withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) }, () => {
      runOnJS(setPhase)('selecting');
    });
    colorProgress.value = withDelay(800, withTiming(1, { duration: 1000 }));
  };

  const handleSelectOption = async (option: string) => {
    console.log("Selected timing:", option);
    setPhase('filling');

    try {
      // プロフィール情報を取得
      const [techStackStr, hobbiesStr] = await AsyncStorage.multiGet([
        'techStack',
        'hobbies',
      ]);

      const techStack = techStackStr[1] ? JSON.parse(techStackStr[1]) : [];
      const hobbies = hobbiesStr[1] ? JSON.parse(hobbiesStr[1]) : [];

      // 過去のタスクタイトルを取得
      const previousTitles = await getPreviousTitles(profileId);

      // タスク生成を呼び出し
      const { data, error } = await supabase.functions.invoke('generate-tasks', {
        body: {
          profile_id: profileId,
          diagnostic_id: diagnosticId,
          timing: option,
          task_levels: 'quick/core/deep',
          profile: {
            job_title: techStack[0] || 'エンジニア',
            hobbies: hobbies,
            interests: techStack,
          },
          metrics: scores || { exploration: 50, immersion: 50, organization: 50, contribution: 50, vitality: 50 },
          previous_titles: previousTitles,
        },
      });

      if (error) {
        console.error('Task generation error:', error);
      } else if (data?.task_ids && data.task_ids.length > 0) {
        // タスク生成成功：Supabaseからタスクを取得してMission形式に変換
        console.log('Tasks generated:', data);

        try {
          // 診断IDに紐づくタスクを取得
          const tasks = await getTasksByDiagnosticId(diagnosticId);

          // DBTask形式からMission形式に変換
          const taskMissions = tasks.slice(0, 3).map(convertTaskToMission);

          // generatedTasksに設定（これによりカードが実データで表示される）
          setGeneratedTasks(taskMissions);

          console.log('Tasks converted to missions:', taskMissions);
        } catch (e) {
          console.error('Failed to fetch tasks from DB:', e);
          // エラーの場合はモックデータを使用（既存の動作）
        }
      }

      // 1.5秒後に塗りつぶし
      fillProgress.value = withDelay(
        1500,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) }, () => {
          runOnJS(setPhase)('completed');
        })
      );

    } catch (e) {
      console.error('Failed to generate tasks:', e);
      // エラーでも続行
      fillProgress.value = withDelay(
        1500,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) }, () => {
          runOnJS(setPhase)('completed');
        })
      );
    }
  };

  // チャートと文字の全消し
  const chartFadeOutProps = useAnimatedProps(() => ({
    opacity: interpolate(moveProgress.value, [0, 0.2], [1, 0], 'clamp')
  }));
  const chartFadeOutStyle = useAnimatedStyle(() => ({
    opacity: interpolate(moveProgress.value, [0, 0.2], [1, 0], 'clamp')
  }));

  // 🚀 復活: 線がシューッと繋がって描画され、ボタンで消える
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <StarryBackground />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.header}><Text style={styles.headerTitle}>MISSION ANALYSIS</Text></View>

        <View style={styles.displayArea}>
          <View style={styles.chartContainer}>
            <Svg height="500" width="400" viewBox="0 0 400 500">
              <Defs>
                <RadialGradient id="vertexGlow" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" /><Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" /></RadialGradient>
              </Defs>

              <AnimatedG animatedProps={chartFadeOutProps}>
                {[150, 100, 50].map(r => (
                  <Polygon key={`grid-${r}`} points={[0, 1, 2, 3, 4].map(i => { const p = getVertex(r, i); return `${p.x},${p.y}`; }).join(' ')} stroke={RADAR_GRID} strokeWidth="1" strokeDasharray="4,4" fill="transparent" />
                ))}
                <AnimatedPath animatedProps={polygonProps} fill={POLYGON_FILL} strokeLinejoin="round" />
              </AnimatedG>

              {chartData.map((d, i) => (
                <StellarPoint key={`point-${i}`} x={getVertex(145 * (d.score / 100), i).x} y={getVertex(145 * (d.score / 100), i).y} index={i} moveProgress={moveProgress} />
              ))}
            </Svg>

            <Animated.View style={[StyleSheet.absoluteFill, chartFadeOutStyle]} pointerEvents="none">
              {chartData.map((d, i) => {
                const rad = ((i * 360) / 5 - 90) * Math.PI / 180;
                const x = 200 + 175 * Math.cos(rad); const y = 200 + 175 * Math.sin(rad);
                return <View key={`label-${i}`} style={[styles.labelWrapper, { left: x - 40, top: y - 20 }]}><Text style={styles.labelText}>{d.label}</Text><Text style={styles.labelScore}>{Math.round(d.score)}</Text></View>;
              })}
            </Animated.View>
          </View>

          <View style={styles.cardOverlay} pointerEvents="none">
            {missions.map((item, i) => (
              <CyberCard key={`card-${i}`} index={i} item={item} moveProgress={moveProgress} spinProgress={spinProgress} colorProgress={colorProgress} fillProgress={fillProgress} />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          {phase === 'analysis' && (
            <TouchableOpacity onPress={handleStart} style={styles.actionButton}>
              <Text style={styles.buttonText}>MATERIALIZE</Text>
            </TouchableOpacity>
          )}

          {phase === 'selecting' && (
            <View style={styles.selectionContainer}>
              <Text style={styles.questionText}>より最適な提案のために、あなたの空き状況を教えてください</Text>
              <View style={styles.optionsWrapper}>
                <TouchableOpacity onPress={() => handleSelectOption('now')} style={styles.optionButton}>
                  <Text style={styles.optionText}>今からやる</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectOption('morning')} style={styles.optionButton}>
                  <Text style={styles.optionText}>明日の朝やる</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectOption('auto')} style={styles.optionButton}>
                  <Text style={styles.optionText}>おまかせ</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {phase === 'filling' && (
            <View style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.buttonText, { color: RADAR_THEME }]}>GENERATING...</Text>
            </View>
          )}

          {phase === 'completed' && (
            <TouchableOpacity onPress={handleComplete} style={styles.actionButton}>
              <Text style={[styles.buttonText, { color: '#000' }]}>START MISSIONS</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const CyberCard = ({ index, item, moveProgress, spinProgress, colorProgress, fillProgress }: { index: number, item: Mission, moveProgress: SharedValue<number>, spinProgress: SharedValue<number>, colorProgress: SharedValue<number>, fillProgress: SharedValue<number> }) => {
  const perimeter = (CARD_WIDTH + CARD_HEIGHT) * 2;

  const traceProps1 = useAnimatedProps(() => {
    const baseOffset = interpolate(spinProgress.value, [0, 1], [perimeter, 0]);
    const offset = baseOffset - (perimeter * 0);
    const stroke = interpolateColor(colorProgress.value, [0, 1], ['#FFFFFF', item.color]);
    const opacity = interpolate(moveProgress.value, [0.8, 1], [0, 1], 'clamp') * interpolate(fillProgress.value, [0, 0.2], [1, 0], 'clamp');
    return { strokeDasharray: `${perimeter * 0.15} ${perimeter}`, strokeDashoffset: offset, stroke, opacity };
  });

  const traceProps2 = useAnimatedProps(() => {
    const baseOffset = interpolate(spinProgress.value, [0, 1], [perimeter, 0]);
    const offset = baseOffset - (perimeter * 0.5);
    const stroke = interpolateColor(colorProgress.value, [0, 1], ['#FFFFFF', item.color]);
    const opacity = interpolate(moveProgress.value, [0.8, 1], [0, 1], 'clamp') * interpolate(fillProgress.value, [0, 0.2], [1, 0], 'clamp');
    return { strokeDasharray: `${perimeter * 0.15} ${perimeter}`, strokeDashoffset: offset, stroke, opacity };
  });

  const fillStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(fillProgress.value, [0, 0.2, 1], [0, 0.8, 0.15]),
      backgroundColor: item.color,
      transform: [{ scale: interpolate(fillProgress.value, [0, 0.2, 1], [0.9, 1.05, 1]) }]
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: fillProgress.value,
      transform: [{ translateY: interpolate(fillProgress.value, [0, 1], [15, 0]) }]
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      opacity: fillProgress.value,
      borderColor: item.color,
      borderWidth: 2,
      backgroundColor: 'rgba(0,0,0,0.5)'
    };
  });

  return (
    <View style={[styles.cardContainer, { top: CARD_Y_POSITIONS[index] }]}>
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <AnimatedRect x="0" y="0" width="100%" height="100%" rx="16" fill="transparent" strokeWidth="4" animatedProps={traceProps1} />
          <AnimatedRect x="0" y="0" width="100%" height="100%" rx="16" fill="transparent" strokeWidth="4" animatedProps={traceProps2} />
        </Svg>
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 16 }, fillStyle]} />

      <Animated.View style={[styles.cardContentBox, borderStyle]}>
        <Animated.View style={[styles.cardInfo, contentStyle]}>
          <Text style={[styles.cardCat, { color: item.color }]}>{item.cat}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Feather name="zap" size={24} color={item.color} style={{ position: 'absolute', right: 20, bottom: 20 }} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

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

  cardOverlay: { position: 'absolute', top: 20, width: 400, height: 500, alignItems: 'center' },
  cardContainer: { position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT },
  cardContentBox: { ...StyleSheet.absoluteFillObject, borderRadius: 16 },
  cardInfo: { flex: 1, padding: 25, justifyContent: 'center' },
  cardCat: { fontSize: 11, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },

  footer: { width: '100%', alignItems: 'center', paddingBottom: 40, height: 180, justifyContent: 'center' },
  actionButton: { width: width * 0.7, paddingVertical: 18, borderRadius: 40, alignItems: 'center', backgroundColor: '#FFF' },
  primaryBtn: { backgroundColor: '#FFF', borderColor: '#FFF' },
  secondaryBtn: { backgroundColor: 'transparent', borderColor: 'transparent' },
  buttonText: { fontWeight: '900', letterSpacing: 2, fontSize: 14, fontFamily: 'monospace', color: '#000' },

  selectionContainer: { width: '100%', alignItems: 'center', paddingHorizontal: 20 },
  questionText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', textShadowColor: RADAR_THEME, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8, letterSpacing: 1 },
  optionsWrapper: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  optionButton: { flex: 1, marginHorizontal: 5, paddingVertical: 14, backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: RADAR_THEME, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  optionText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
});