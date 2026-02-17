import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Polygon, Line, Text as SvgText, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🎨 ホーム画面と統一したモードカラー
const MODE_COLORS: { [key: string]: string } = {
  explore: '#3B82F6',    // 🟦 青
  immerse: '#22C55E',    // 🟢 緑
  organize: '#A855F7',   // 🟣 紫
  contribute: '#F97316', // 🧡 オレンジ
  rest: '#06B6D4',       // 🩵 シアン
};

const LABELS = [
  { key: 'explore', label: '探索', icon: 'magnify' },
  { key: 'immerse', label: '没頭', icon: 'poker-chip' },
  { key: 'contribute', label: '貢献', icon: 'hand-heart' },
  { key: 'rest', label: '休息', icon: 'power-sleep' },
  { key: 'organize', label: '整理', icon: 'file-tree' },
];

const CENTER = 150;
const RADIUS = 95; // グラフ自体のサイズ
const LABEL_DISTANCE = 125; // ラベルを配置する距離（頂点より外側）
const ANGLE_STEP = (Math.PI * 2) / 5;

export default function ChartScreen() {
  const router = useRouter();

  // 📝 解析データ（モック）
  const baseData = { explore: 80, immerse: 90, contribute: 40, rest: 30, organize: 60 };
  const diaryCorrection = { explore: 0, immerse: -10, contribute: +15, rest: -5, organize: +5 };

  type ModeKey = keyof typeof baseData;

  // 📈 データ補正計算
  const correctedData: Record<ModeKey, number> = (Object.keys(baseData) as ModeKey[]).reduce((acc, key) => {
    const base = Number(baseData[key]) || 0;
    const correction = Number(diaryCorrection[key]) || 0;
    const value = Math.max(0, Math.min(100, base + correction));
    acc[key] = value;
    return acc;
  }, {} as Record<ModeKey, number>);

  // 📐 座標計算関数
  const getCoordinates = (data: any, radiusLimit: number = RADIUS) => {
    return LABELS.map((cat, i) => {
      const val = data[cat.key] || 0;
      const r = (radiusLimit * val) / 100;
      const x = CENTER + r * Math.cos(ANGLE_STEP * i - Math.PI / 2);
      const y = CENTER + r * Math.sin(ANGLE_STEP * i - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');
  };

  // ドミナントカラーの選定
  const dominantMode = (Object.keys(correctedData) as ModeKey[]).reduce((a, b) =>
    correctedData[a] > correctedData[b] ? a : b
  );
  const activeColor = MODE_COLORS[dominantMode];

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Neural Analysis</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 📊 レーダーチャートセクション */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTag}>{`// CALIBRATION_SUCCESSFUL`}</Text>
            
            <View style={styles.svgWrapper}>
              <Svg height="320" width="320" viewBox="0 0 320 320">
                <Defs>
                  <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={activeColor} stopOpacity="0.3" />
                    <Stop offset="100%" stopColor={activeColor} stopOpacity="0.05" />
                  </RadialGradient>
                </Defs>

                {/* グリッド五角形（背景） */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((p) => (
                  <Polygon
                    key={p}
                    points={getCoordinates({ explore: 100 * p, immerse: 100 * p, contribute: 100 * p, rest: 100 * p, organize: 100 * p })}
                    fill="none"
                    stroke="#2A2A2A"
                    strokeWidth="1"
                  />
                ))}
                
                {/* 軸線（中心から頂点へ） */}
                {LABELS.map((_, i) => {
                  const x = CENTER + RADIUS * Math.cos(ANGLE_STEP * i - Math.PI / 2);
                  const y = CENTER + RADIUS * Math.sin(ANGLE_STEP * i - Math.PI / 2);
                  return <Line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#2A2A2A" strokeWidth="1" />;
                })}

                {/* 基本データ（グレーの点線） */}
                <Polygon points={getCoordinates(baseData)} fill="none" stroke="#444" strokeWidth="1" strokeDasharray="4,4" />
                
                {/* 補正後メインデータ（太いカラー線） */}
                <Polygon 
                  points={getCoordinates(correctedData)} 
                  fill="url(#grad)" 
                  stroke={activeColor} 
                  strokeWidth="3" 
                  strokeLinejoin="round"
                />

                {/* 各頂点の強調ドット */}
                {LABELS.map((cat, i) => {
                  const coords = getCoordinates(correctedData).split(' ')[i].split(',');
                  return <Circle key={i} cx={coords[0]} cy={coords[1]} r="4" fill={MODE_COLORS[cat.key]} />;
                })}

                {/* 頂点のラベル配置 */}
                {LABELS.map((cat, i) => {
                  const x = CENTER + LABEL_DISTANCE * Math.cos(ANGLE_STEP * i - Math.PI / 2);
                  const y = CENTER + LABEL_DISTANCE * Math.sin(ANGLE_STEP * i - Math.PI / 2);
                  const isRight = x > CENTER;
                  const isLeft = x < CENTER;

                  return (
                    <G key={i}>
                      <SvgText
                        x={x}
                        y={y}
                        fill={correctedData[cat.key as ModeKey] > 70 ? "#FFF" : "#888"}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor={isRight ? "start" : isLeft ? "end" : "middle"}
                        alignmentBaseline="middle"
                      >
                        {cat.label}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </View>

            {/* モード凡例 */}
            <View style={styles.legendGrid}>
              {LABELS.map((cat) => (
                <View key={cat.key} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: MODE_COLORS[cat.key] }]} />
                  <Text style={styles.legendText}>{cat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 🔍 詳細リスト */}
          <View style={styles.detailsList}>
            <Text style={styles.sectionTitle}>Neural Log Details</Text>
            {LABELS.map((cat) => (
              <View key={cat.key} style={styles.paramCard}>
                <View style={styles.paramHeader}>
                  <View style={[styles.iconBox, { backgroundColor: MODE_COLORS[cat.key] + '20' }]}>
                    <MaterialCommunityIcons name={cat.icon as any} size={20} color={MODE_COLORS[cat.key]} />
                  </View>
                  <Text style={styles.paramLabel}>{cat.label}</Text>
                  <Text style={styles.paramValue}>{correctedData[cat.key as ModeKey]}%</Text>
                  
                  {diaryCorrection[cat.key as ModeKey] !== 0 && (
                    <View style={[styles.correctionBadge, { backgroundColor: diaryCorrection[cat.key as ModeKey] > 0 ? '#10b98120' : '#ef444420' }]}>
                      <Text style={{ color: diaryCorrection[cat.key as ModeKey] > 0 ? '#10b981' : '#ef4444', fontSize: 10, fontWeight: 'bold' }}>
                        {diaryCorrection[cat.key as ModeKey] > 0 ? '▲' : '▼'} {Math.abs(diaryCorrection[cat.key as ModeKey])}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.adviceText}>{getAdvice(cat.key, correctedData[cat.key as ModeKey])}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getAdvice(key: string, val: number) {
  if (key === 'rest' && val < 40) return "リソース不足。休息が必要です。";
  if (key === 'immerse' && val > 85) return "集中力が高まっています。そのまま継続してください。";
  return "パラメータは安定しています。";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  
  chartCard: { backgroundColor: '#1A1A1A', borderRadius: 32, padding: 24, alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 5 },
  cardTag: { alignSelf: 'flex-start', color: '#444', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
  svgWrapper: { alignItems: 'center', justifyContent: 'center' },
  
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#888', fontSize: 11, fontWeight: '600' },

  detailsList: { gap: 12 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  paramCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 18 },
  paramHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconBox: { padding: 8, borderRadius: 12 },
  paramLabel: { color: '#FFF', fontSize: 15, fontWeight: '600', marginLeft: 12, flex: 1 },
  paramValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  correctionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  adviceText: { color: '#666', fontSize: 13, lineHeight: 18, marginLeft: 44 },
});