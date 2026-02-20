import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Diagnostic, MetricKey } from '../../types';

interface InsightCardProps {
    diagnostic?: Diagnostic | null;
}

// パラメータ名のマッピング
const metricLabels: Record<MetricKey, string> = {
    exploration: '探索',
    immersion: '没頭',
    organization: '整理',
    contribution: '貢献',
    vitality: '元気',
};

// パラメータ別の色
const metricColors: Record<MetricKey, string> = {
    exploration: '#3B82F6', // Blue
    immersion: '#10B981',   // Emerald
    organization: '#8B5CF6', // Violet
    contribution: '#F97316', // Orange
    vitality: '#06B6D4',    // Cyan
};

// パラメータ別のコメント
const metricComments: Record<MetricKey, string> = {
    exploration: '好奇心が旺盛な状態です。新しい技術や知識を積極的に吸収しましょう。',
    immersion: '素晴らしい集中状態です。このまま創作活動を続けると、さらに良い結果が得られるでしょう。',
    organization: '思考がクリアな状態です。複雑な問題の整理や設計に取り組む絶好のタイミングです。',
    contribution: '外向きのエネルギーが高まっています。チームへの発信や協力を積極的に行いましょう。',
    vitality: 'エネルギーが充実しています。体を動かしたり、リフレッシュ活動を楽しみましょう。',
};

const InsightCard = ({ diagnostic }: InsightCardProps) => {
    // デフォルト値
    let topMetric: MetricKey = 'immersion';
    let topScore = 90;
    let topLabel = '没頭';
    let description = metricComments.immersion;

    // 実際のデータがある場合
    if (diagnostic) {
        const metrics: Record<MetricKey, number> = {
            exploration: diagnostic.exploration,
            immersion: diagnostic.immersion,
            organization: diagnostic.organization,
            contribution: diagnostic.contribution,
            vitality: diagnostic.vitality,
        };

        // 最高スコアのメトリックを取得
        const maxEntry = Object.entries(metrics).reduce((max, [key, value]) =>
            value > max.value ? { key: key as MetricKey, value } : max,
            { key: 'immersion' as MetricKey, value: -Infinity }
        );

        topMetric = maxEntry.key;
        topScore = Math.round(maxEntry.value); // 表示は整数
        topLabel = metricLabels[topMetric];
        description = metricComments[topMetric];
    }

    return (
        <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
                <Feather name="zap" size={18} color="#10B981" />
                <Text style={styles.insightTitle}>Current Focus</Text>
            </View>
            <View style={styles.insightValueContainer}>
                <Text style={[styles.insightValueLabel, { color: metricColors[topMetric] }]}>{topLabel}</Text>
                <Text style={styles.insightValue}>({topScore})</Text>
            </View>
            <Text style={styles.insightDescription}>
                {description}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    insightCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // Slate-800/50
        padding: 24,
        borderRadius: 24,
        borderColor: '#334155',
        borderWidth: 1,
        width: '100%',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    insightTitle: {
        color: '#4ade80', // Green-400
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
    },
    insightValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    insightValueLabel: {
        fontSize: 36,
        fontWeight: 'bold',
        marginRight: 8,
    },
    insightValue: {
        fontSize: 20,
        color: '#4ade80',
        fontWeight: 'bold',
    },
    insightDescription: {
        color: '#94a3b8',
        lineHeight: 24,
    },
});

export default InsightCard;
