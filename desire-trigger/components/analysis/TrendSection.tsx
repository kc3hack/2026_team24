import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMonthlyDiagnostics } from '../../supabase/diagnostics';
import { Diagnostic } from '../../types';
import { useDataModeStore } from '../../store/dataModeStore';

const width = Dimensions.get('window').width;
const CHART_WIDTH = width - 40; // Full width minus padding
const CHART_HEIGHT = 180;
const GRAPH_HEIGHT = 130;
const PADDING_TOP = 20;
const PADDING_LEFT = 50; // Y軸目盛り用のスペース
const PADDING_RIGHT = 30;
const GRAPH_WIDTH = CHART_WIDTH - (PADDING_LEFT + PADDING_RIGHT);

// View Modes
type ViewMode = 'week' | 'month';

// Mock Data: Week (7 Days) vs Month (4 Weeks)
const LABELS_WEEK = ['2/12', '2/13', '2/14', '2/15', '2/16', '2/17', 'Today'];
const LABELS_MONTH = ['1st Week', '2nd Week', '3rd Week', '4th Week'];

// Metric Types
type MetricKey = 'exploration' | 'immersion' | 'refactor' | 'contribution' | 'idle';

interface MetricConfig {
    key: MetricKey;
    label: string;
    color: string;
    description: string;
}

const METRICS: MetricConfig[] = [
    { key: 'exploration', label: '探索', color: '#3B82F6', description: '新しい技術への関心推移' },
    { key: 'immersion', label: '没頭', color: '#10B981', description: '集中状態の持続力' },
    { key: 'refactor', label: '整理', color: '#8B5CF6', description: '思考とコードの整頓' },
    { key: 'contribution', label: '貢献', color: '#F97316', description: 'チームへのアウトプット' },
    { key: 'idle', label: '元気', color: '#06B6D4', description: 'エネルギー残量' },
];

const getMockData = (key: MetricKey, mode: ViewMode) => {
    if (mode === 'week') {
        switch (key) {
            case 'exploration': return [40, 45, 60, 55, 75, 70, 70];
            case 'immersion': return [30, 40, 80, 85, 90, 88, 90];
            case 'refactor': return [60, 55, 50, 45, 50, 55, 50];
            case 'contribution': return [20, 25, 30, 35, 30, 35, 40];
            case 'idle': return [90, 85, 70, 60, 50, 45, 85];
            default: return [50, 50, 50, 50, 50, 50, 50];
        }
    } else {
        // Month Data (4 points for 4 weeks)
        switch (key) {
            case 'exploration': return [30, 50, 60, 75]; // Rising
            case 'immersion': return [70, 65, 80, 90]; // Dipped then rose
            case 'refactor': return [80, 70, 60, 50]; // Declining
            case 'contribution': return [40, 45, 40, 45]; // Stable low
            case 'idle': return [60, 50, 55, 70]; // Recovering
            default: return [50, 50, 50, 50];
        }
    }
};

const BUFF_EVENTS: Record<MetricKey, number[]> = {
    exploration: [2, 4],
    immersion: [2, 3, 4],
    refactor: [5],
    contribution: [],
    idle: [6],
};
// Map month indexes to something? Let's just say specific weeks had buffs?
const BUFF_EVENTS_MONTH: Record<MetricKey, number[]> = {
    exploration: [2], // 3rd week buff
    immersion: [1, 3],
    refactor: [],
    contribution: [3],
    idle: [0],
};

// Y軸目盛りを計算する関数
const calculateYAxisTicks = (data: number[]): number[] => {
    // 1. データが空またはnull/undefinedの場合のガード処理
    if (!data || data.length === 0 || data.every(v => v == null || isNaN(v))) {
        return [0, 25, 50, 75, 100]; // デフォルト値を返す
    }

    // 有効な数値のみをフィルタリング
    const validData = data.filter(v => v != null && !isNaN(v) && isFinite(v));
    if (validData.length === 0) {
        return [0, 25, 50, 75, 100];
    }

    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const range = max - min;

    // データ範囲が大きい場合は固定目盛り（0, 25, 50, 75, 100）
    if (range >= 60) {
        return [0, 25, 50, 75, 100];
    }

    // データ範囲に応じて動的に調整
    const adjustedMin = Math.floor(min / 10) * 10;
    const adjustedMax = Math.ceil(max / 10) * 10;

    // 2. stepが0以下になった場合のフォールバック
    let step = Math.ceil((adjustedMax - adjustedMin) / 5 / 10) * 10;
    if (step <= 0 || !isFinite(step)) {
        step = 25; // デフォルトのステップ値
    }

    const ticks: number[] = [];
    // 3. ticksの最大数を制限（最大10個まで）
    const maxTicks = 10;
    let tickCount = 0;

    for (let i = adjustedMin; i <= adjustedMax && tickCount < maxTicks; i += step) {
        ticks.push(i);
        tickCount++;
    }

    // ticksが空の場合のフォールバック
    if (ticks.length === 0) {
        return [0, 25, 50, 75, 100];
    }

    // 100を含める
    if (ticks[ticks.length - 1] < 100) {
        ticks.push(100);
    }

    return ticks;
};

export default function TrendSection() {
    const [activeMetric, setActiveMetric] = useState<MetricKey>('immersion');
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [data, setData] = useState<number[]>([50, 50, 50, 50, 50, 50, 50]);
    const [loading, setLoading] = useState(false);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

    const { dataMode } = useDataModeStore();
    const progress = useSharedValue(0);

    useEffect(() => {
        loadDiagnostics();
    }, [dataMode]);

    useEffect(() => {
        if (diagnostics.length > 0) {
            processData();
        }
    }, [activeMetric, viewMode, diagnostics]);

    const loadDiagnostics = async () => {
        try {
            setLoading(true);

            // MOCKモードの場合はモックデータを使用
            if (dataMode === 'mock') {
                const { generateMockDiagnostics } = await import('../../constants/mockData');
                const mockDiagnostics = generateMockDiagnostics();
                setDiagnostics(mockDiagnostics);
                setLoading(false);
                return;
            }

            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) return;

            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const data = await getMonthlyDiagnostics(profileId, year, month);
            setDiagnostics(data);
        } catch (e) {
            console.error('Failed to load diagnostics:', e);
        } finally {
            setLoading(false);
        }
    };

    const processData = () => {
        progress.value = 0;

        if (diagnostics.length === 0) {
            setData(getMockData(activeMetric, viewMode));
        } else {
            // 実データから抽出
            const metricKeyMap: Record<MetricKey, keyof Diagnostic> = {
                exploration: 'exploration',
                immersion: 'immersion',
                refactor: 'organization',
                contribution: 'contribution',
                idle: 'vitality',
            };

            const key = metricKeyMap[activeMetric];

            if (viewMode === 'week') {
                // 過去7日分（最新7件）
                const last7 = diagnostics.slice(-7);
                const values = last7.map(d => d[key] as number);
                setData(values.length > 0 ? values : [50, 50, 50, 50, 50, 50, 50]);
            } else {
                // 月次: 週ごとに平均
                const weeklyData: number[] = [];
                for (let week = 0; week < 4; week++) {
                    const start = week * 7;
                    const end = start + 7;
                    const weekDiags = diagnostics.slice(start, end);
                    if (weekDiags.length > 0) {
                        const avg = weekDiags.reduce((sum, d) => sum + (d[key] as number), 0) / weekDiags.length;
                        weeklyData.push(Math.round(avg));
                    }
                }
                setData(weeklyData.length > 0 ? weeklyData : [50, 50, 50, 50]);
            }
        }

        progress.value = withTiming(1, { duration: 800 });
    };

    const activeConfig = METRICS.find(m => m.key === activeMetric)!;
    const labels = viewMode === 'week' ? LABELS_WEEK : LABELS_MONTH;
    const buffs = viewMode === 'week' ? BUFF_EVENTS[activeMetric] : BUFF_EVENTS_MONTH[activeMetric];

    const getPathD = () => {
        // データが不足している場合のガード
        if (!data || data.length === 0) {
            return `M ${PADDING_LEFT} ${PADDING_TOP + GRAPH_HEIGHT}`;
        }

        // データが1つだけの場合
        if (data.length === 1) {
            const y = PADDING_TOP + GRAPH_HEIGHT - (data[0] / 100) * GRAPH_HEIGHT;
            return `M ${PADDING_LEFT} ${y}`;
        }

        const stepX = GRAPH_WIDTH / (data.length - 1);
        // Map value 0-100 to y position (Note: GRAPH_HEIGHT is bottom, 0 is top relative to graph area)
        // Adjust coordinate system: Y=0 is top.
        // We want 100 to be at PADDING_TOP, 0 to be at GRAPH_HEIGHT + PADDING_TOP

        let d = `M ${PADDING_LEFT} ${PADDING_TOP + GRAPH_HEIGHT - (data[0] / 100) * GRAPH_HEIGHT}`;
        for (let i = 1; i < data.length; i++) {
            const x = PADDING_LEFT + i * stepX;
            const y = PADDING_TOP + GRAPH_HEIGHT - (data[i] / 100) * GRAPH_HEIGHT;
            d += ` L ${x} ${y}`;
        }
        return d;
    };

    const trendMessage = () => {
        // データが不足している場合のガード
        if (!data || data.length < 2) {
            return "データを蓄積中です。";
        }

        const first = data[0]; // 最古値
        const last = data[data.length - 1]; // 最新値

        // 値が不正な場合のガード
        if (first == null || last == null || isNaN(first) || isNaN(last)) {
            return "データを確認中です。";
        }

        const diff = last - first;

        // 上昇傾向（+10以上）
        if (diff >= 10) {
            return `上昇中です。この調子を維持しましょう。`;
        }

        // 下降傾向（-10以下）
        if (diff <= -10) {
            return `少し下がり気味です。意識して取り組んでみましょう。`;
        }

        // 安定（-10〜+10の範囲）
        return `安定しています。この調子を維持しましょう。`;
    };

    const points = data.map((val, i) => {
        // データが1つの場合の特別処理
        const stepX = data.length > 1 ? GRAPH_WIDTH / (data.length - 1) : 0;
        const x = PADDING_LEFT + i * stepX;
        const y = PADDING_TOP + GRAPH_HEIGHT - (val / 100) * GRAPH_HEIGHT;
        return { x, y, val, isBuff: buffs.includes(i) };
    });

    // Y軸目盛りを計算
    const yAxisTicks = calculateYAxisTicks(data);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: (1 - progress.value) * 10 }]
    }));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Trend Analysis</Text>
                    <Text style={styles.subtitle}>{viewMode === 'week' ? '過去7日間の推移' : '過去1ヶ月の推移'}</Text>
                </View>

                {/* View Mode Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
                        onPress={() => setViewMode('week')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'month' && styles.toggleButtonActive]}
                        onPress={() => setViewMode('month')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>Month</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer} contentContainerStyle={{ paddingRight: 20 }}>
                {METRICS.map((metric) => (
                    <TouchableOpacity
                        key={metric.key}
                        onPress={() => setActiveMetric(metric.key)}
                        style={[
                            styles.tab,
                            activeMetric === metric.key && { backgroundColor: metric.color + '20', borderColor: metric.color }
                        ]}
                    >
                        <View style={[styles.tabDot, { backgroundColor: metric.color }]} />
                        <Text style={[
                            styles.tabText,
                            activeMetric === metric.key && { color: metric.color, fontWeight: 'bold' }
                        ]}>
                            {metric.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Chart */}
            <Animated.View style={[styles.chartContainer, animatedStyle]}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={activeConfig.color} stopOpacity="0.5" />
                            <Stop offset="1" stopColor={activeConfig.color} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>

                    {/* Y軸目盛り線と数値 */}
                    {yAxisTicks.map((tick) => {
                        const y = PADDING_TOP + GRAPH_HEIGHT - (tick / 100) * GRAPH_HEIGHT;
                        return (
                            <G key={tick}>
                                {/* 目盛り線（破線） */}
                                <Line
                                    x1={PADDING_LEFT}
                                    y1={y}
                                    x2={CHART_WIDTH - PADDING_RIGHT}
                                    y2={y}
                                    stroke="#334155"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                {/* 目盛り数値 */}
                                <SvgText
                                    x={PADDING_LEFT - 10}
                                    y={y + 4}
                                    fill="#64748b"
                                    fontSize="10"
                                    textAnchor="end"
                                >
                                    {tick}
                                </SvgText>
                            </G>
                        );
                    })}

                    {/* Area */}
                    <Path
                        d={`${getPathD()} L ${CHART_WIDTH - PADDING_RIGHT} ${PADDING_TOP + GRAPH_HEIGHT} L ${PADDING_LEFT} ${PADDING_TOP + GRAPH_HEIGHT} Z`}
                        fill="url(#gradient)"
                    />

                    {/* Line */}
                    <Path
                        d={getPathD()}
                        stroke={activeConfig.color}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points & Buff Icons */}
                    {points.map((p, i) => (
                        <G key={i}>
                            <Circle cx={p.x} cy={p.y} r="4" fill="#1e293b" stroke={activeConfig.color} strokeWidth="2" />

                            {/* Buff Icon */}
                            {p.isBuff && (
                                <G x={p.x - 10} y={p.y - 25}>
                                    <Circle cx="10" cy="10" r="10" fill={activeConfig.color} />
                                    <Path
                                        d="M10 6 L10 14 M6 10 L10 6 L14 10"
                                        stroke="white"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                </G>
                            )}

                            {/* Label */}
                            <SvgText
                                x={p.x}
                                y={CHART_HEIGHT - 5}
                                fill="#94a3b8"
                                fontSize="10"
                                textAnchor="middle"
                            >
                                {labels[i]}
                            </SvgText>
                        </G>
                    ))}
                </Svg>
            </Animated.View>

            {/* Analysis Message */}
            <View style={[styles.messageBox, { borderColor: activeConfig.color + '40', backgroundColor: activeConfig.color + '10' }]}>
                <Feather name="info" size={16} color={activeConfig.color} />
                <Text style={styles.messageText}>
                    <Text style={{ fontWeight: 'bold', color: activeConfig.color }}>{activeConfig.label}: </Text>
                    {trendMessage()}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E293B', // Slate-800
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 12,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    trendText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#0f172a',
        borderRadius: 20,
        padding: 4,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    toggleButtonActive: {
        backgroundColor: '#334155',
    },
    toggleText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: '#f8fafc',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        marginRight: 8,
        backgroundColor: '#0f172a',
    },
    tabDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    messageText: {
        color: '#e2e8f0',
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
    },
});
