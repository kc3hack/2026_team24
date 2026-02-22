import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import RadarChartSection from '../../components/analysis/RadarChartSection';
import TrendSection from '../../components/analysis/TrendSection';
import MetricDetailModal from '../../components/analysis/MetricDetailModal';
import { MetricKey } from '../../components/analysis/MetricDetailCard';
import InsightCard from '../../components/analysis/InsightCard';
import { getLatestDiagnostic } from '../../supabase/diagnostics';
import { Diagnostic } from '../../types';
import { SpaceBackground } from '../../components/ui/SpaceBackground';
import { useDataModeStore } from '../../store/dataModeStore';
import { Colors } from '../../constants/Colors';

export default function ChartScreen() {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>('immersion');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [latestDiagnostic, setLatestDiagnostic] = useState<Diagnostic | null>(null);
    const [loading, setLoading] = useState(true);

    const { dataMode } = useDataModeStore();

    useFocusEffect(
        useCallback(() => {
            loadLatestDiagnostic();
        }, [dataMode])
    );

    const loadLatestDiagnostic = async () => {
        try {
            setLoading(true);

            // MOCKモードの場合はモックデータを使用
            if (dataMode === 'mock') {
                const { generateMockDiagnostics } = await import('../../constants/mockData');
                const mockDiagnostics = generateMockDiagnostics();
                // 最新の診断データを取得
                const latestDiag = mockDiagnostics.length > 0 ? mockDiagnostics[0] : null;
                setLatestDiagnostic(latestDiag);
                setLoading(false);
                return;
            }

            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) {
                throw new Error('Profile ID not found');
            }

            const diagnostic = await getLatestDiagnostic(profileId);
            setLatestDiagnostic(diagnostic);
        } catch (e) {
            console.error('Failed to load latest diagnostic:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleMetricSelect = (key: MetricKey) => {
        setSelectedMetric(key);
        setIsModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <SpaceBackground />
                <SafeAreaView style={styles.safeArea}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Area */}
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.headerLabel}>ANALYSIS</Text>
                        <Text style={styles.headerTitle}>状態分析レポート</Text>
                    </View>
                </View>

                {/* Radar Chart Section */}
                <View style={styles.sectionContainer}>
                    <RadarChartSection
                        onMetricSelect={handleMetricSelect}
                        selectedMetric={selectedMetric}
                        metricsData={latestDiagnostic ? {
                            exploration: latestDiagnostic.exploration,
                            immersion: latestDiagnostic.immersion,
                            organization: latestDiagnostic.organization,
                            contribution: latestDiagnostic.contribution,
                            vitality: latestDiagnostic.vitality,
                        } : undefined}
                    />
                </View>

                {/* Insight Card (Component) */}
                <View style={styles.sectionContainer}>
                    <InsightCard diagnostic={latestDiagnostic} />
                </View>

                {/* Trend Section */}
                <View style={styles.sectionContainer}>
                    <TrendSection />
                </View>

            </ScrollView>

            {/* Metric Detail Modal */}
            <MetricDetailModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                metricKey={selectedMetric}
                onMetricChange={setSelectedMetric}
                diagnostic={latestDiagnostic}
            />
        </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510', // 宇宙背景に合わせた背景色
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLabel: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: Colors.textDim,
        letterSpacing: 2,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 1,
    },
    sectionContainer: {
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },




});



