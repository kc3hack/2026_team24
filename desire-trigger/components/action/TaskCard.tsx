import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    // Animated props passed from Carousel
    animatedStyle?: any;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // 75% of screen width

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, animatedStyle }) => {
    // Style based on levelType
    const getBorderColor = () => {
        if (task.isCompleted || task.status === 'applied') return Colors.textDim;
        switch (task.levelType) {
            case 'quick': return Colors.primary; // Cyan
            case 'core': return Colors.secondary; // Purple
            case 'deep': return Colors.warning; // Yellow
            default: return Colors.primary;
        }
    };

    const borderColor = getBorderColor();
    const isCompleted = task.isCompleted || task.status === 'applied';

    return (
        <Animated.View style={[styles.wrapper, animatedStyle, { width: CARD_WIDTH }]}>
            <TouchableOpacity
                style={[
                    styles.container,
                    { borderColor: borderColor },
                    isCompleted && styles.completedContainer
                ]}
                onPress={onPress}
                disabled={isCompleted}
                activeOpacity={0.9}
            >
                {/* Header: Category & Level */}
                <View style={styles.header}>
                    <View style={[styles.badge, { backgroundColor: borderColor + '40' }]}>
                        <Text style={[styles.badgeText, { color: borderColor }]}>
                            {task.category}
                        </Text>
                    </View>
                    <Text style={[styles.level, { color: borderColor }]}>
                        {task.levelType?.toUpperCase()}
                    </Text>
                </View>

                {/* Title */}
                <Text
                    style={[styles.title, isCompleted && styles.completedText]}
                    numberOfLines={2}
                >
                    {task.title}
                </Text>



                {/* Footer: Buff & Timer */}
                <View style={styles.footer}>
                    <View style={styles.buffContainer}>
                        <Ionicons name="arrow-up-circle" size={16} color={isCompleted ? Colors.textDim : Colors.success} />
                        <Text style={[styles.buffText, isCompleted && { color: Colors.textDim }]}>
                            {task.buff_metric.toUpperCase()} +{task.buffValue}
                        </Text>
                    </View>

                    <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={16} color={Colors.textDim} />
                        <Text style={styles.timerText}>24:00:00</Text>
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
        marginHorizontal: 10,
    },
    container: {
        backgroundColor: 'rgba(18, 18, 42, 0.9)', // Higher opacity for main card
        borderRadius: 16,
        borderWidth: 2,
        padding: 24,
        height: 320, // Fixed height for carousel uniformity
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
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
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    level: {
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    title: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
        marginTop: 16,
    },
    description: {
        color: Colors.textDim,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        flex: 1,
    },
    completedText: {
        color: Colors.textDim,
        textDecorationLine: 'line-through',
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
        color: Colors.success,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerText: {
        color: Colors.textDim,
        fontSize: 12,
        fontFamily: 'monospace',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 14,
    },
    stamp: {
        borderWidth: 4,
        borderColor: Colors.success,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        transform: [{ rotate: '-15deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    stampText: {
        color: Colors.success,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
    },
});
