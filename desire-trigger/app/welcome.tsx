import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Easing, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { height, width } = Dimensions.get('window');

// ⚙️ システム設定：エンジニアリング・リソース最適化
const COLUMN_COUNT = 18; // 列数
const CHAR_COUNT_PER_COL = 35; // 1列あたりの文字数
const CHARGE_DURATION = 6000;

const NEON_GREEN = '#39FF14'; 
const NEON_RED = '#FF073A';   

// 👾 高速データ・ストリーム（列単位で描画を最適化）
const MatrixColumn = React.memo(({ isStable }: { isStable: boolean }) => {
  const [stream, setStream] = useState("");
  const [redPos, setRedPos] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      // 数字の更新（文字列として一括処理）
      let newStream = "";
      for (let i = 0; i < CHAR_COUNT_PER_COL; i++) {
        newStream += Math.random() > 0.5 ? "1\n" : "0\n";
      }
      setStream(newStream);
      
      // ノイズ（赤）の位置をランダムに変更
      if (!isStable) {
        setRedPos(Math.floor(Math.random() * CHAR_COUNT_PER_COL));
      } else {
        setRedPos(-1);
      }
    }, 80 + Math.random() * 100); // 各列にバラつきを持たせて自然なパチパチ感

    return () => clearInterval(timer);
  }, [isStable]);

  return (
    <View style={styles.columnContainer}>
      <Text style={[styles.matrixText, { color: NEON_GREEN }]}>
        {/* 文字列をスプリットして、一箇所だけ赤色にするロジック */}
        {stream.split('\n').map((char, idx) => (
          <Text key={idx} style={{ color: idx === redPos ? NEON_RED : NEON_GREEN }}>
            {char}{'\n'}
          </Text>
        ))}
      </Text>
    </View>
  );
});

export default function WelcomeScreen() {
  const router = useRouter();
  const chargeAnim = useRef(new Animated.Value(0)).current;
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    const id = chargeAnim.addListener(({ value }) => {
      // チャージ100%で全緑化
      if (value >= 0.99) setIsStable(true);
      else setIsStable(false);
    });
    return () => chargeAnim.removeListener(id);
  }, [isStable]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(chargeAnim, { toValue: 1, duration: CHARGE_DURATION, easing: Easing.linear, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    if ((chargeAnim as any)._value > 0.98) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/setup');
    } else {
      Animated.timing(chargeAnim, { toValue: 0, duration: 400, useNativeDriver: false }).start();
    }
  };

  const uiColor = isStable ? NEON_GREEN : NEON_RED;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* 背景：ノード数を激減させた軽量マトリックス */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        {[...Array(COLUMN_COUNT)].map((_, i) => (
          <MatrixColumn key={i} isStable={isStable} />
        ))}
      </View>

      <SafeAreaView style={{ flex: 1, paddingHorizontal: 30 }}>
        <View style={{ flex: 1, alignItems: 'center', marginTop: 50 }}>
          
          <View style={[styles.iconContainer, { borderColor: uiColor, shadowColor: uiColor }]}>
            <MaterialCommunityIcons 
              name={isStable ? "brain" : "head-cog-outline"} 
              size={64} 
              color={uiColor} 
            />
          </View>

          <Text style={[styles.statusText, { color: uiColor }]}>
            {isStable ? '> DECODING_COMPLETE' : '> SCANNING_ENGINEER_CORE...'}
          </Text>
          
          <View style={styles.titleContainer}>
            <Text style={styles.titleBase}>Desire</Text>
            <Text style={[styles.titleAccent, { color: uiColor, textShadowColor: uiColor }]}>Trigger</Text>
          </View>

          <View style={{ width: '100%', marginTop: 60 }}>
            <Pressable 
              onPressIn={handlePressIn} 
              onPressOut={handlePressOut} 
              style={[styles.button, { borderColor: uiColor }]}
            >
              <Animated.View 
                style={[
                  styles.chargeBar, 
                  { 
                    width: chargeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), 
                    backgroundColor: uiColor, 
                  }
                ]} 
              />
              <View style={styles.buttonContent}>
                <Feather name={isStable ? "play" : "lock"} size={26} color="#FFF" style={{ marginRight: 15 }} />
                <Text style={styles.buttonText}>{isStable ? "BOOT" : "EXTRACT"}</Text>
              </View>
            </Pressable>
            
            <Text style={[styles.guideText, { color: isStable ? NEON_GREEN : '#444' }]}>
              {isStable ? "DATA SYNCHRONIZED" : "HOLD TO ANALYZE"}
            </Text>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-around',
    opacity: 0.5,
  },
  columnContainer: {
    width: width / COLUMN_COUNT,
    alignItems: 'center',
  },
  matrixText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 20,
    textShadowRadius: 5,
  },
  iconContainer: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10, backgroundColor: '#000',
  },
  statusText: { fontWeight: 'bold', letterSpacing: 2, fontSize: 10, marginBottom: 8 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  titleBase: { color: '#FFF', fontSize: 44, fontWeight: '900', fontStyle: 'italic', textShadowColor: '#FFF', textShadowRadius: 8 },
  titleAccent: { fontSize: 44, fontWeight: '900', fontStyle: 'italic', marginLeft: 10, textShadowRadius: 15 },
  button: { width: '100%', height: 75, backgroundColor: '#050505', borderRadius: 20, borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  chargeBar: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.8 },
  buttonText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  guideText: { fontSize: 10, textAlign: 'center', marginTop: 15, fontWeight: 'bold', letterSpacing: 1 },
});