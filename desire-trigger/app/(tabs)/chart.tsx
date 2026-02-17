import React, { useState } from 'react'; // reload trigger
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@expo/vector-icons';
import RadarChartSection from '../../components/analysis/RadarChartSection';
import TrendSection from '../../components/analysis/TrendSection';
import MetricDetailModal from '../../components/analysis/MetricDetailModal';
import { MetricKey } from '../../components/analysis/MetricDetailCard';
import InsightCard from '../../components/analysis/InsightCard';


export default function ChartScreen() {

    const [selectedMetric, setSelectedMetric] = useState<MetricKey>('immersion');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleMetricSelect = (key: MetricKey) => {
        setSelectedMetric(key);
        setIsModalVisible(true);
    };

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
                    <RadarChartSection onMetricSelect={handleMetricSelect} selectedMetric={selectedMetric} />
                </View>

                {/* Insight Card (Component) */}
                <View style={styles.sectionContainer}>
                    <InsightCard />
                </View>

                {/* Trend Section */}
                <View style={styles.sectionContainer}>
                    <TrendSection />
                </View>

                {/* Action Button */}


            </ScrollView>

            {/* Metric Detail Modal */}
            <MetricDetailModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                metricKey={selectedMetric}
                onMetricChange={setSelectedMetric}
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



