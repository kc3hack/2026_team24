import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';
import { CARD_WIDTH, CARD_HEIGHT } from '../../constants/Layout';

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    // Animated props passed from Carousel
    animatedStyle?: any;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, animatedStyle }) => {
    // Style based on levelType
    const getThemeColor = () => {
        if (task.isCompleted || task.status === 'applied') return Colors.textDim;
        switch (task.levelType) {
            case 'quick': return '#00F0FF'; // Cyan
            case 'core': return '#FF0055';  // Magenta
            case 'deep': return '#FFD700';  // Yellow
            default: return '#00F0FF';
        }
    };

    const themeColor = getThemeColor();
    const isCompleted = task.isCompleted || task.status === 'applied';

    return (
        <Animated.View style={[styles.wrapper, animatedStyle, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            <TouchableOpacity
                style={[
                    styles.container,
                    { borderColor: themeColor },
                    isCompleted && styles.completedContainer
                ]}
                onPress={onPress}
                disabled={isCompleted}
                activeOpacity={0.9}
            >
                {/* Header: Category & Level */}
                <View style={styles.header}>
                    <View style={[styles.badge, { backgroundColor: themeColor + '20', borderColor: themeColor }]}>
                        <Text style={[styles.badgeText, { color: themeColor }]}>
                            {task.category}
                        </Text>
                    </View>
                    <Text style={[styles.level, { color: themeColor }]}>
                        {task.levelType?.toUpperCase()}
                    </Text>
                </View>

                {/* Title */}
                <Text
                    style={[styles.title, { color: isCompleted ? Colors.textDim : themeColor }]}
                    numberOfLines={2}
                >
                    {task.title}
                </Text>

                {/* Footer: Buff & Timer */}
                <View style={styles.footer}>
                    <View style={styles.buffContainer}>
                        <Ionicons name="arrow-up-circle" size={16} color={isCompleted ? Colors.textDim : themeColor} />
                        <Text style={[styles.buffText, { color: isCompleted ? Colors.textDim : themeColor }]}>
                            {(task.buff_metric?.toUpperCase() || 'BUFF')} +{task.buffValue}
                        </Text>
                    </View>

                    <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={16} color={isCompleted ? Colors.textDim : themeColor} />
                        <Text style={[styles.timerText, { color: isCompleted ? Colors.textDim : themeColor }]}>
                            24:00:00
                        </Text>
                    </View>
                </View>

                {/* Completed Overlay Stamp */}
                {isCompleted && (
                    <View style={styles.overlay}>
                        <View style={styles.stamp}>
                            <Text style={styles.stampText}>APPLIED</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        // Wrapper for Animation
        // No margin needed here as positioning is handled by parent container logic
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(10, 10, 26, 0.95)', // Darker background for neon contrast
        borderRadius: 16,
        borderWidth: 2,
        padding: 24,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    completedContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    level: {
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    title: {
        fontSize: 28, // Large title for vertical card
        fontWeight: '900',
        lineHeight: 36,
        letterSpacing: 1,
        marginTop: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 16,
    },
    buffContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    buffText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerText: {
        fontSize: 12,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 14,
    },
    stamp: {
        borderWidth: 4,
        borderColor: Colors.success,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        transform: [{ rotate: '-15deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    stampText: {
        color: Colors.success,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
    },
});
