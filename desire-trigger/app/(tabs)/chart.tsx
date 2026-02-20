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

export default function ChartScreen() {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>('immersion');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [latestDiagnostic, setLatestDiagnostic] = useState<Diagnostic | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadLatestDiagnostic();
        }, [])
    );

    const loadLatestDiagnostic = async () => {
        try {
            setLoading(true);
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
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Area */}
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.headerLabel}>ANALYSIS</Text>
                        <Text style={styles.headerTitle}>状態分析レポート</Text>
                    </View>
                    <TouchableOpacity style={styles.shareButton}>
                        <Feather name="share-2" size={20} color="#9ca3af" />
                    </TouchableOpacity>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate-900 (Matching Trend/Radar background base)
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
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1.5,
    },
    headerTitle: {
        color: '#f8fafc',
        fontSize: 24,
        fontWeight: 'bold',
    },
    shareButton: {
        backgroundColor: '#1e293b',
        padding: 12,
        borderRadius: 9999,
    },
    sectionContainer: {
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },




});



