import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const InsightCard = () => {
    return (
        <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
                <Feather name="zap" size={18} color="#10B981" />
                <Text style={styles.insightTitle}>Current Focus</Text>
            </View>
            <View style={styles.insightValueContainer}>
                <Text style={styles.insightValueLabel}>没頭</Text>
                <Text style={styles.insightValue}>(90)</Text>
            </View>
            <Text style={styles.insightDescription}>
                素晴らしい集中状態です。このまま創作活動を続けると、さらに良い結果が得られるでしょう。
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    insightCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // Slate-800/50
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
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
        color: '#f8fafc',
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
