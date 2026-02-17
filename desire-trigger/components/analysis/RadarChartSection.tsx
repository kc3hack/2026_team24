
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, interpolate } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { MetricKey } from './MetricDetailCard';

// 5 Metrics
const analysisMetrics: { key: MetricKey; label: string; value: number; color: string }[] = [
  { key: 'exploration', label: '探索', value: 70, color: '#3B82F6' }, // Blue
  { key: 'immersion', label: '没頭', value: 90, color: '#10B981' },   // Emerald
  { key: 'refactor', label: '整理', value: 50, color: '#8B5CF6' },    // Violet
  { key: 'contribution', label: '貢献', value: 40, color: '#F97316' }, // Orange
  { key: 'idle', label: '元気', value: 85, color: '#06B6D4' },        // Cyan
];

const width = Dimensions.get('window').width;
const SVG_SIZE = width - 40; // SVG takes most of width
const RADIUS = (SVG_SIZE / 2) * 0.55; // Chart is 55% of the SVG half-size (smaller to fit labels)
const CENTER = SVG_SIZE / 2;

// Animated SVG Component
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedG = Animated.createAnimatedComponent(G);

interface RadarChartSectionProps {
  onMetricSelect?: (key: MetricKey) => void;
  selectedMetric?: MetricKey;
}

const RadarChartSection = ({ onMetricSelect, selectedMetric }: RadarChartSectionProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 90 }));
  }, []);

  // Calculate points for the chart
  const angleStep = (Math.PI * 2) / 5;

  const calculatePoints = (data: typeof analysisMetrics, scale: number = 1) => {
    return data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const valueScale = (item.value / 100) * scale;
      const x = CENTER + RADIUS * valueScale * Math.cos(angle);
      const y = CENTER + RADIUS * valueScale * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Grid Levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const animatedChartStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: progress.value }]
    };
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>System Analysis</Text>
        <Text style={styles.subtitle}>Current Status Overview</Text>
      </View>

      {/* Chart Area */}
      <View style={styles.chartWrapper}>
        <Animated.View style={[animatedChartStyle]}>
          <Svg width={SVG_SIZE} height={SVG_SIZE}>
            {/* Grid Lines (Pentagons) */}
            {gridLevels.map((level, i) => (
              <Polygon
                key={`grid-${i}`}
                points={calculatePoints(analysisMetrics.map(m => ({ ...m, value: 100 })), level)}
                stroke="#334155" // Slate-700
                strokeWidth={1}
                fill={i === 4 ? "rgba(30, 41, 59, 0.5)" : "transparent"} // Fill background
              />
            ))}

            {/* Axes */}
            {analysisMetrics.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x = CENTER + RADIUS * Math.cos(angle);
              const y = CENTER + RADIUS * Math.sin(angle);
              return (
                <Line
                  key={`axis-${i}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
                  stroke="#334155"
                  strokeWidth={1}
                />
              );
            })}

            {/* Data Areas */}
            <AnimatedPolygon
              points={calculatePoints(analysisMetrics)}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#8B5CF6"
              strokeWidth={2}
            />

            {/* Labels & Dots */}
            {analysisMetrics.map((item, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = RADIUS + 35; // Moved further out for visibility
              const x = CENTER + labelRadius * Math.cos(angle);
              const y = CENTER + labelRadius * Math.sin(angle);

              // Data point dot
              const valueScale = item.value / 100;
              const dotX = CENTER + RADIUS * valueScale * Math.cos(angle);
              const dotY = CENTER + RADIUS * valueScale * Math.sin(angle);

              const isSelected = selectedMetric === item.key;

              return (
                <G key={`label-${i}`} onPress={() => onMetricSelect?.(item.key)}>
                  {/* Hit Area for easier tapping */}
                  <Circle cx={x} cy={y} r={30} fill="transparent" />

                  {/* Selection Glow/Highlight */}
                  {isSelected && (
                    <Circle cx={dotX} cy={dotY} r={10} fill={item.color} opacity={0.3} />
                  )}

                  <Circle
                    cx={dotX}
                    cy={dotY}
                    r={isSelected ? 6 : 4}
                    fill={item.color}
                    stroke={isSelected ? 'white' : 'none'}
                    strokeWidth={2}
                  />
                  <SvgText
                    x={x}
                    y={y}
                    fill={isSelected ? item.color : item.color}
                    fontSize={isSelected ? "16" : "14"}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {item.label}
                  </SvgText>
                  <SvgText
                    x={x}
                    y={y + 15}
                    fill="#94a3b8"
                    fontSize="11"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {item.value}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>


        {/* Diary Correction UI (Badge) - Absolute Positioned over chart */}
        <Animated.View style={[styles.badge, animatedChartStyle, { top: 20, right: 30 }]}>
          <View style={styles.badgeContent}>
            <Feather name="arrow-up" size={12} color="#10B981" />
            <Text style={styles.badgeText}>+10%</Text>
          </View>
          <Text style={styles.badgeLabel}>Diary Bonus</Text>
        </Animated.View>
      </View>

      {/* Stats Footer */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Score</Text>
          <Text style={styles.statValue}>335</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Condition</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>絶好調</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a', // Slate-900
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  header: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    color: '#f8fafc', // Slate-50
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8', // Slate-400
    fontSize: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badge: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Emerald-500 with low opacity
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  badgeLabel: {
    color: '#6ee7b7', // Emerald-300
    fontSize: 8,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#1e293b', // Slate-800
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default RadarChartSection;
