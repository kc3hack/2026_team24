import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Diagnostic } from '../../types';

// Metric Types (Should ideally be shared, but defining here for now)
export type MetricKey = 'exploration' | 'immersion' | 'refactor' | 'contribution' | 'idle';

interface MetricDetail {
    key: MetricKey;
    label: string;
    value: number;
    color: string;
    description: string;
    advice: string;
    tags: string[];
    icon: keyof typeof Feather.glyphMap;
}

// Order of metrics for swiping/display
export const METRIC_ORDER: MetricKey[] = ['exploration', 'immersion', 'refactor', 'contribution', 'idle'];

// Detailed Data Configuration
export const detailedMetrics: Record<MetricKey, MetricDetail> = {
    exploration: {
        key: 'exploration',
        label: "探索",
        value: 70,
        color: "#3B82F6", // Blue
        description: "新しい技術やトレンドへの関心度",
        advice: "意欲は十分です。次はキャッチアップした技術を実際に小さく試してみましょう（Hello World等）。",
        tags: ["Input", "Curiosity"],
        icon: "compass"
    },
    immersion: {
        key: 'immersion',
        label: "没頭",
        value: 90,
        color: "#10B981", // Emerald
        description: "コーディングや制作への集中度",
        advice: "素晴らしい集中力！ゾーンに入っています。疲れに気づきにくいので、ポモドーロタイマー等を活用して。",
        tags: ["Output", "Flow"],
        icon: "zap"
    },
    refactor: {
        key: 'refactor',
        label: "整理",
        value: 50,
        color: "#8B5CF6", // Violet
        description: "思考とコードの整頓",
        advice: "少し散らかり気味かも？週末に1時間だけ、コードのリファクタリングやデスクの整理時間を設けましょう。",
        tags: ["Clean", "Maintenance"],
        icon: "layers"
    },
    contribution: {
        key: 'contribution',
        label: "貢献",
        value: 40,
        color: "#F97316", // Orange
        description: "チームへのアウトプット",
        advice: "個人の作業に集中しすぎているかもしれません。PRレビューやドキュメント更新でチームに還元してみましょう。",
        tags: ["Team", "Share"],
        icon: "users"
    },
    idle: {
        key: 'idle',
        label: "元気",
        value: 85,
        color: "#06B6D4", // Cyan
        description: "エネルギー残量",
        advice: "エネルギーは満タンです！この調子で新しいプロジェクトや難易度の高いタスクに挑戦してみましょう。",
        tags: ["Health", "Energy"],
        icon: "sun"
    }
};

interface MetricDetailCardProps {
    metricKey: MetricKey;
    diagnostic?: Diagnostic | null;
}

// スコアに応じた定型アドバイス
const getDefaultAdvice = (score: number): string => {
    if (score >= 70) {
        return 'この分野は好調です。強みを活かした行動を心がけましょう。';
    } else if (score >= 40) {
        return 'バランスが取れています。少し意識を向けることでさらに伸びます。';
    } else {
        return '回復が必要なサインです。無理せず改善を心がけましょう。';
    }
};

export default function MetricDetailCard({ metricKey, diagnostic }: MetricDetailCardProps) {
    const detail = detailedMetrics[metricKey];

    // メトリックキーのマッピング（refactor→organization, idle→vitality）
    const metricKeyMap: Record<MetricKey, keyof Diagnostic> = {
        exploration: 'exploration',
        immersion: 'immersion',
        refactor: 'organization',
        contribution: 'contribution',
        idle: 'vitality',
    };

    // 実際のスコアとadviceを取得
    let actualValue = detail.value; // デフォルト値
    let actualAdvice = detail.advice; // デフォルトアドバイス

    if (diagnostic) {
        const dbKey = metricKeyMap[metricKey];
        actualValue = Math.round(diagnostic[dbKey] as number); // 表示は整数

        // adviceがjsonbの場合、該当メトリックのadviceを取得
        if (diagnostic.advice && typeof diagnostic.advice === 'object') {
            const adviceObj = diagnostic.advice as Record<string, string>;
            const adviceKey = dbKey; // exploration, immersion, etc.
            actualAdvice = adviceObj[adviceKey] || getDefaultAdvice(actualValue);
        } else {
            actualAdvice = getDefaultAdvice(actualValue);
        }
    }

    // Animation
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        // Reset and animate in when metricKey changes
        opacity.value = 0;
        translateY.value = 20;

        opacity.value = withTiming(1, { duration: 400 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 90 });
    }, [metricKey]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <Animated.View style={[styles.card, animatedStyle, { borderColor: detail.color + '50' }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: detail.color + '20' }]}>
                    <Feather name={detail.icon} size={24} color={detail.color} />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.label, { color: detail.color }]}>{detail.label}</Text>
                    <Text style={styles.description}>{detail.description}</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={[styles.scoreValue, { color: detail.color }]}>{actualValue}</Text>
                </View>
            </View>

            {/* Advice Section */}
            <View style={[styles.adviceContainer, { backgroundColor: detail.color + '10', borderLeftColor: detail.color }]}>
                <Text style={styles.adviceTitle}>💡 Advice</Text>
                <Text style={styles.adviceText}>{actualAdvice}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E293B', // Slate-800
        borderRadius: 24,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        color: '#94a3b8', // Slate-400
        fontSize: 12,
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    scoreLabel: {
        color: '#64748b', // Slate-500
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    adviceContainer: {
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        marginBottom: 16,
    },
    adviceTitle: {
        color: '#e2e8f0', // Slate-200
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    adviceText: {
        color: '#cbd5e1', // Slate-300
        fontSize: 14,
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#0f172a', // Slate-900
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
