import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Defs, RadialGradient, Stop, G, Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withDelay,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
  interpolateColor,
  SharedValue,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarryBackground from '../../components/ui/StarryBackground';

const { width, height } = Dimensions.get('window');
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

const SPACE_BG = '#020617';
const RADAR_THEME = '#00E5FF';

const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 110;
const CARD_GAP = 20;

type Mission = { cat: string; title: string; color: string; level?: string; };

const MOCK_MISSIONS: Mission[] = [
  { cat: '没頭', title: '焼肉を食う', color: '#39FF14', level: 'QUICK' },
  { cat: '元気', title: '高級焼肉を食う', color: '#22D3EE', level: 'CORE' },
  { cat: '探索', title: '高級焼肉を奢ってもらう', color: '#FF00FF', level: 'DEEP' }
];



export default function TasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [showButton, setShowButton] = useState(false);

  const fillProgress = useSharedValue(0);

  // Hooks は常に同じ順序で呼び出す必要がある
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: showButton ? withTiming(1, { duration: 400 }) : 0,
    transform: [{ translateY: showButton ? withSpring(0, { damping: 15 }) : 20 }]
  }));

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksStr = await AsyncStorage.getItem('generated_tasks');
      if (tasksStr) {
        const loadedTasks = JSON.parse(tasksStr);
        setTasks(loadedTasks);
      } else {
        setTasks(MOCK_MISSIONS);
      }

      // タスクカード表示開始
      fillProgress.value = withDelay(
        2000,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) }, (finished) => {
          if (finished) {
            runOnJS(setShowButton)(true);
          }
        })
      );
    } catch (e) {
      console.error('Failed to load tasks:', e);
      setTasks(MOCK_MISSIONS);
    }
  };

  const handleStart = () => {
    router.replace('/(tabs)/action');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <StarryBackground />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>YOUR MISSIONS</Text>
        </View>

        <View style={styles.tasksContainer}>
          {tasks.map((task, index) => (
            <CyberCard
              key={`task-${index}`}
              task={task}
              index={index}
              fillProgress={fillProgress}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Animated.View
            style={[
              styles.actionButton,
              buttonAnimatedStyle,
              !showButton && { pointerEvents: 'none' }
            ]}
          >
            <TouchableOpacity onPress={handleStart} style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.buttonText}>はじめる →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CyberCard = ({ task, index, fillProgress }: {
  task: Mission;
  index: number;
  fillProgress: SharedValue<number>;
}) => {
  const spinProgress = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const traceOpacity = useSharedValue(0)

  const perimeter = (CARD_WIDTH + CARD_HEIGHT) * 2;

  useEffect(() => {
    const BASE_DELAY = index * 200; // インデックスごとの遅延も短縮
    
    // 画面が開いて星が現れたら、即座に線をパッと表示
    traceOpacity.value = withDelay(BASE_DELAY + 300, withTiming(1, { duration: 10 }));

    // 光の無限周回（即座にスタート）
    spinProgress.value = withDelay(
      BASE_DELAY + 300,
      withRepeat(withTiming(1, { duration: 200, easing: Easing.linear }), -1, false)
    );
    // 色の変化（枠を塗りつぶし始める）
    colorProgress.value = withDelay(
      BASE_DELAY + 500, 
      withTiming(1, { duration: 800 })
    );
  }, []);

  const traceProps1 = useAnimatedProps(() => {
    const baseOffset = interpolate(spinProgress.value, [0, 1], [perimeter, 0]);
    const stroke = interpolateColor(colorProgress.value, [0, 1], ['#FFFFFF', task.color]);
    const fadeOut = interpolate(fillProgress.value, [0, 0.2], [1, 0], 'clamp');
    
    return {
      strokeDasharray: `${perimeter * 0.15} ${perimeter}`,
      strokeDashoffset: baseOffset,
      stroke,
      // 💡 透明度と太さの両方を0にしてチラ見えを完全に防ぐ
      strokeOpacity: traceOpacity.value === 0 ? 0 : fadeOut,
      strokeWidth: traceOpacity.value === 0 ? 0 : 3, 
    };
  });

  const traceProps2 = useAnimatedProps(() => {
    const baseOffset = interpolate(spinProgress.value, [0, 1], [perimeter, 0]);
    const stroke = interpolateColor(colorProgress.value, [0, 1], ['#FFFFFF', task.color]);
    const fadeOut = interpolate(fillProgress.value, [0, 0.2], [1, 0], 'clamp');
    
    return {
      strokeDasharray: `${perimeter * 0.15} ${perimeter}`,
      strokeDashoffset: baseOffset - (perimeter * 0.5),
      stroke,
      // 💡 こちらも同様に追加
      strokeOpacity: traceOpacity.value === 0 ? 0 : fadeOut,
      strokeWidth: traceOpacity.value === 0 ? 0 : 3,
    };
  });

  const fillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fillProgress.value, [0, 0.2, 1], [0, 0.8, 0.15]),
    backgroundColor: task.color,
    transform: [{ scale: interpolate(fillProgress.value, [0, 0.2, 1], [0.9, 1.05, 1]) }]
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fillProgress.value,
    transform: [{ translateY: interpolate(fillProgress.value, [0, 1], [15, 0]) }]
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: fillProgress.value,
    borderColor: task.color,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)'
  }));

  return (
    <View style={[styles.cardContainer, { marginBottom: CARD_GAP }]}>
      {/* 周回する光のエフェクト */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <AnimatedRect x="0" y="0" width="100%" height="100%" rx="16" fill="transparent" animatedProps={traceProps1} />
          <AnimatedRect x="0" y="0" width="100%" height="100%" rx="16" fill="transparent" animatedProps={traceProps2} />
        </Svg>
      </View>

      {/* 塗りつぶし背景 */}
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 16 }, fillStyle]} />

      {/* カード内容 */}
      <Animated.View style={[styles.cardContentBox, borderStyle]}>
        <Animated.View style={[styles.cardInfo, contentStyle]}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskCat, { color: task.color }]}>{task.cat}</Text>
            {task.level && (
              <View style={[styles.levelBadge, { backgroundColor: `${task.color}33` }]}>
                <Text style={[styles.levelText, { color: task.color }]}>{task.level}</Text>
              </View>
            )}
          </View>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Feather name="zap" size={24} color={task.color} style={styles.taskIcon} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SPACE_BG },
  contentWrapper: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: RADAR_THEME, fontSize: 14, fontWeight: '900', letterSpacing: 5 },
  tasksContainer: { flex: 1, width: CARD_WIDTH, justifyContent: 'center', paddingVertical: 20 },
  cardContainer: { position: 'relative', width: CARD_WIDTH, height: CARD_HEIGHT },
  cardContentBox: { ...StyleSheet.absoluteFillObject, borderRadius: 16 },
  cardInfo: { flex: 1, padding: 25, justifyContent: 'center' },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCat: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  taskTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  taskIcon: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
    height: 120,
    justifyContent: 'center',
  },
  actionButton: {
    width: width * 0.7,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  buttonText: {
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#000',
  },
});
