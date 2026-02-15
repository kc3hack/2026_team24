import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
    data: {
        labels: string[];
        datasets: { data: number[] }[];
    };
    width: number;
    height: number;
    maxValue?: number;
}

export default function RadarChart({ data, width, height, maxValue = 100 }: RadarChartProps) {
    const radius = Math.min(width, height) / 2.5;
    const center = { x: width / 2, y: height / 2 };
    const angleStep = (Math.PI * 2) / data.labels.length;

    const dataset = data.datasets[0].data;

    // Calculate polygon points
    const points = dataset.map((value, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const r = (value / maxValue) * radius;
        const x = center.x + r * Math.cos(angle);
        const y = center.y + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Calculate grid lines (e.g., 5 levels)
    const levels = [0.2, 0.4, 0.6, 0.8, 1];
    const gridPolygons = levels.map(level => {
        return data.labels.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const r = radius * level;
            const x = center.x + r * Math.cos(angle);
            const y = center.y + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    });

    return (
        <View className="items-center justify-center">
            <Svg width={width} height={height}>
                {/* Draw Web (Grid) */}
                {gridPolygons.map((polyPoints, i) => (
                    <Polygon
                        key={i}
                        points={polyPoints}
                        stroke="#e5e7eb" // gray-200
                        strokeWidth="1"
                        fill="transparent"
                    />
                ))}

                {/* Draw Axes */}
                {data.labels.map((_, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const x = center.x + radius * Math.cos(angle);
                    const y = center.y + radius * Math.sin(angle);
                    return (
                        <Line
                            key={index}
                            x1={center.x}
                            y1={center.y}
                            x2={x}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Draw Data Polygon */}
                <Polygon
                    points={points}
                    fill="rgba(167, 139, 250, 0.6)" // calm-500 with opacity
                    stroke="#a78bfa" // calm-500
                    strokeWidth="2"
                />

                {/* Draw Labels */}
                {data.labels.map((label, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const labelRadius = radius + 20;
                    const x = center.x + labelRadius * Math.cos(angle);
                    const y = center.y + labelRadius * Math.sin(angle);

                    return (
                        <SvgText
                            key={index}
                            x={x}
                            y={y}
                            fill="#6b7280" // gray-500
                            fontSize="12"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {label}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
}
