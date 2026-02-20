import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Alert, Modal, Switch } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { resetDebugDate } from '../lib/dateUtils';
import { useDataModeStore } from '../store/dataModeStore';

const { width, height } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- ⚙️ システム設定 ---
const BG_DARK = '#000208';
const THEME_CYAN = '#00E5FF';
const THEME_PURPLE = '#7C5CFF';
const THEME_GREEN = '#39FF14';

const PORTAL_SIZE = Math.min(width, height) * 1.0; // もやの範囲を最大化
const PORTAL_CENTER_X = width / 2;
const PORTAL_CENTER_Y = height * 0.50;

const STAR_COUNT = 150;
const MAX_STAR_RADIUS = Math.sqrt(width * width + height * height) * 0.8; // 円形範囲

const generateStars = () => {
  const colors = ['#FFFFFF', THEME_CYAN, THEME_PURPLE];
  return [...Array(STAR_COUNT)].map(() => {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.sqrt(Math.random()) * MAX_STAR_RADIUS;
    return {
      id: Math.random(),
      x: PORTAL_CENTER_X + radius * Math.cos(angle),
      y: PORTAL_CENTER_Y + radius * Math.sin(angle),
      size: Math.random() * 1.8 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
};

export default function SupernovaWelcome() {
  const router = useRouter();
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const stars = useMemo(() => generateStars(), []);

  // Data Mode Store
  const { dataMode, loadDataMode, toggleDataMode } = useDataModeStore();

  // Debug Modal State
  const [debugModalVisible, setDebugModalVisible] = useState(false);

  const charge = useSharedValue(0);
  const portalScale = useSharedValue(1);
  const portalOpacity = useSharedValue(1);
  const uiFade = useSharedValue(1);
  const starGatherProgress = useSharedValue(0);
  const isLaunching = useSharedValue(false);

  // アプリ起動時にdata_modeを読み込む
  useEffect(() => {
    loadDataMode();
  }, []);

  // 1. 画面遷移の実行
  useEffect(() => {
    if (targetPath) {
      const timer = setTimeout(() => {
        router.replace(targetPath as any);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [targetPath]);

  // 2. ポータルの静かな消滅（フラッシュなし）
  const triggerPortalFadeOut = () => {
    portalScale.value = withTiming(1.1, { duration: 400, easing: Easing.out(Easing.quad) });
    portalOpacity.value = withTiming(0, { duration: 400 });
  };

  // 3. アニメーションシーケンスの開始
  const startSequence = async () => {
    let next: string = '/(tabs)';
    try {
      // profile_idの存在確認（Supabaseプロフィールの有無）
      const profileId = await AsyncStorage.getItem('profile_id');
      if (!profileId) {
        // プロフィール未作成 → セットアップへ
        next = '/setup';
      }
    } catch (e) {
      console.error('Failed to check profile_id:', e);
      next = '/setup';
    }

    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { }

    uiFade.value = withTiming(0, { duration: 250 });

    // 星の収束（サイズ0へ）
    starGatherProgress.value = withTiming(1, {
      duration: 500,
      easing: Easing.bezier(0.25, 1, 0.5, 1)
    }, (finished) => {
      if (finished) {
        runOnJS(triggerPortalFadeOut)();
        runOnJS(setTargetPath)(next);
      }
    });
  };

  const handlePressIn = () => {
    if (isLaunching.value) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) { }
    charge.value = withTiming(1, { duration: 1200 });
    starGatherProgress.value = withTiming(0.12, { duration: 1200 });

    charge.value = withTiming(1, { duration: 1200 }, (finished) => {
      if (finished && !isLaunching.value) {
        isLaunching.value = true;
        runOnJS(startSequence)();
      }
    });
  };

  const handlePressOut = () => {
    if (isLaunching.value) return;
    charge.value = withTiming(0, { duration: 300 });
    starGatherProgress.value = withTiming(0, { duration: 400 });
  };

  const handleResetStorage = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      Alert.alert(
        'データ初期化',
        'すべてのデータを削除しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '削除',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.clear();
              await resetDebugDate();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setDebugModalVisible(false);
              // リロード（画面を再描画）
              router.replace('/welcome');
            },
          },
        ]
      );
    } catch (e) {
      console.error('Failed to reset storage:', e);
    }
  };

  const StarField = () => {
    return stars.map((star) => {
      const animatedProps = useAnimatedProps(() => {
        const p = starGatherProgress.value;
        const currentX = interpolate(p, [0, 1], [star.x, PORTAL_CENTER_X]);
        const currentY = interpolate(p, [0, 1], [star.y, PORTAL_CENTER_Y]);
        const currentSize = interpolate(p, [0, 0.9, 1], [star.size, 0.5, 0], 'clamp');

        return {
          cx: currentX,
          cy: currentY,
          r: currentSize,
          fillOpacity: interpolate(p, [0, 0.8, 1], [0.6, 1, 0]),
        };
      });
      return <AnimatedCircle key={star.id} fill={star.color} animatedProps={animatedProps} />;
    });
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height={height} width={width}>
          <Rect width={width} height={height} fill={BG_DARK} />
          <StarField />
        </Svg>
      </View>

      {/* Terminal Overlay (四隅のIT装飾) */}
      <Animated.View style={[styles.terminalOverlay, { opacity: uiFade }]} pointerEvents="none">
        <View style={styles.termTopLeft}>
          <Text style={styles.termText}>SYS_STATUS: ACTIVE</Text>
          <Text style={styles.termText}>SEC_PROTOCOL: CYBER_SEC_V01</Text>
        </View>
        <View style={styles.termTopRight}>
          <Text style={styles.termText}>NODE_ID: 0x7C5CFF</Text>
          <Text style={styles.termText}>LOC: 34.72N_135.62E</Text>
        </View>
      </Animated.View>

      {/* Portal */}
      <Animated.View style={[{ position: 'absolute', width: PORTAL_SIZE, height: PORTAL_SIZE },
      useAnimatedStyle(() => ({
        transform: [
          { translateX: PORTAL_CENTER_X - PORTAL_SIZE / 2 },
          { translateY: PORTAL_CENTER_Y - PORTAL_SIZE / 2 },
          { scale: portalScale.value }
        ],
        opacity: portalOpacity.value,
      }))]}>
        <Svg width={PORTAL_SIZE} height={PORTAL_SIZE} viewBox={`0 0 ${PORTAL_SIZE} ${PORTAL_SIZE}`}>
          <Defs>
            <RadialGradient id="portalRad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={THEME_CYAN} stopOpacity="0.8" />
              <Stop offset="70%" stopColor={THEME_PURPLE} stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <AnimatedCircle cx={PORTAL_SIZE / 2} cy={PORTAL_SIZE / 2} fill="url(#portalRad)"
            animatedProps={useAnimatedProps(() => ({
              r: (PORTAL_SIZE * 0.25) + interpolate(charge.value, [0, 1], [0, PORTAL_SIZE * 0.2])
            }))}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.uiContainer, { opacity: uiFade }]} pointerEvents="box-none">
        <View style={styles.top}>
          <View style={styles.titleWrapper}>
            <Text style={styles.titleBracket}>[</Text>
            <Text style={styles.brandTitle}>DESIRE　TRIGGER</Text>
            <Text style={styles.titleBracket}>]</Text>
          </View>
          <View style={styles.sep} />
          <Text style={styles.subtitle}></Text>
        </View>

        <View style={styles.bottom}>
          <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View style={styles.actionWrapper}>
              <Animated.Text style={[styles.actionLabel, useAnimatedStyle(() => ({
                color: interpolateColor(charge.value, [0, 1], [THEME_CYAN, THEME_GREEN]),
              }))]}>開始する</Animated.Text>
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.hint}>長押ししてください</Text>
        </View>
      </Animated.View>

      {/* Settings/Debug Button (歯車アイコン) */}
      <TouchableOpacity
        onPress={() => setDebugModalVisible(true)}
        style={styles.settingsButton}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>

      {/* Debug Modal */}
      <Modal
        visible={debugModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDebugModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Debug Settings</Text>
              <TouchableOpacity onPress={() => setDebugModalVisible(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Data Mode Toggle */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>データモード</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>{dataMode === 'mock' ? 'MOCK' : 'LIVE'}</Text>
                <Switch
                  value={dataMode === 'live'}
                  onValueChange={toggleDataMode}
                  trackColor={{ false: '#767577', true: THEME_CYAN }}
                  thumbColor={dataMode === 'live' ? '#FFF' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Full Reset */}
            <View style={styles.modalSection}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonDanger]} onPress={handleResetStorage}>
                <Text style={styles.modalButtonText}>フルリセット</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  terminalOverlay: { ...StyleSheet.absoluteFillObject, padding: 30 },
  termTopLeft: { position: 'absolute', top: 55, left: 25 },
  termTopRight: { position: 'absolute', top: 55, right: 25, alignItems: 'flex-end' },
  termText: { color: THEME_CYAN, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, opacity: 0.5, marginBottom: 4 },
  uiContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 80 },
  top: { alignItems: 'center', marginTop: 30 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center' },
  titleBracket: { color: THEME_CYAN, fontSize: 32, fontWeight: '200', opacity: 0.5, marginHorizontal: 12 },
  brandTitle: {
    color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: 4,
    textShadowColor: THEME_CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  sep: { width: 60, height: 1, backgroundColor: THEME_CYAN, marginVertical: 15, opacity: 0.3 },
  subtitle: { color: THEME_CYAN, fontSize: 10, letterSpacing: 2, fontWeight: 'bold', opacity: 0.8 },
  bottom: { width: '100%', alignItems: 'center', paddingBottom: 0 },
  actionWrapper: { width: 240, height: 64, borderRadius: 4, borderWidth: 1, borderColor: THEME_CYAN, backgroundColor: 'rgba(0,229,255,0.03)', justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, letterSpacing: 3, fontWeight: 'bold' },
  hint: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 15, fontWeight: 'bold' },
  settingsButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: THEME_CYAN,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  modalLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalButton: {
    width: '100%',
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
    borderColor: THEME_CYAN,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});