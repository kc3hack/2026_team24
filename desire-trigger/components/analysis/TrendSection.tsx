import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const width = Dimensions.get('window').width;
const CHART_WIDTH = width - 40; // Full width minus padding
const CHART_HEIGHT = 180;
const GRAPH_HEIGHT = 130;
const PADDING_TOP = 20;
const PADDING_X = 30;
const GRAPH_WIDTH = CHART_WIDTH - (PADDING_X * 2);

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


export default function TrendSection() {
    const [activeMetric, setActiveMetric] = useState<MetricKey>('immersion');
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [data, setData] = useState(getMockData('immersion', 'week'));

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;
        setData(getMockData(activeMetric, viewMode));
        progress.value = withTiming(1, { duration: 800 });
    }, [activeMetric, viewMode]);

    const activeConfig = METRICS.find(m => m.key === activeMetric)!;
    const labels = viewMode === 'week' ? LABELS_WEEK : LABELS_MONTH;
    const buffs = viewMode === 'week' ? BUFF_EVENTS[activeMetric] : BUFF_EVENTS_MONTH[activeMetric];

    const getPathD = () => {
        const stepX = GRAPH_WIDTH / (data.length - 1);
        // Map value 0-100 to y position (Note: GRAPH_HEIGHT is bottom, 0 is top relative to graph area)
        // Adjust coordinate system: Y=0 is top. 
        // We want 100 to be at PADDING_TOP, 0 to be at GRAPH_HEIGHT + PADDING_TOP

        let d = `M ${PADDING_X} ${PADDING_TOP + GRAPH_HEIGHT - (data[0] / 100) * GRAPH_HEIGHT}`;
        for (let i = 1; i < data.length; i++) {
            const x = PADDING_X + i * stepX;
            const y = PADDING_TOP + GRAPH_HEIGHT - (data[i] / 100) * GRAPH_HEIGHT;
            d += ` L ${x} ${y}`;
        }
        return d;
    };

    const trendMessage = () => {
        const last = data[data.length - 1];
        const prev = data[data.length - 2];
        const diff = last - prev;

        if (diff > 5) return "上昇トレンドです！調子が良いですね。";
        if (diff < -5) return "少し下降気味。リフレッシュが必要かも？";
        return "安定しています。この調子を維持しましょう。";
    };

    const points = data.map((val, i) => {
        const x = PADDING_X + i * (GRAPH_WIDTH / (data.length - 1));
        const y = PADDING_TOP + GRAPH_HEIGHT - (val / 100) * GRAPH_HEIGHT;
        return { x, y, val, isBuff: buffs.includes(i) };
    });

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

                    {/* Grid Lines */}
                    <Line x1={PADDING_X} y1={PADDING_TOP} x2={CHART_WIDTH - PADDING_X} y2={PADDING_TOP} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                    <Line x1={PADDING_X} y1={PADDING_TOP + GRAPH_HEIGHT / 2} x2={CHART_WIDTH - PADDING_X} y2={PADDING_TOP + GRAPH_HEIGHT / 2} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                    <Line x1={PADDING_X} y1={PADDING_TOP + GRAPH_HEIGHT} x2={CHART_WIDTH - PADDING_X} y2={PADDING_TOP + GRAPH_HEIGHT} stroke="#334155" strokeWidth="1" />

                    {/* Area */}
                    <Path
                        d={`${getPathD()} L ${CHART_WIDTH - PADDING_X} ${PADDING_TOP + GRAPH_HEIGHT} L ${PADDING_X} ${PADDING_TOP + GRAPH_HEIGHT} Z`}
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
