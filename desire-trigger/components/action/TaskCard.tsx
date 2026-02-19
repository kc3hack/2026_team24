import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';
import { CARD_WIDTH, CARD_HEIGHT } from '../../constants/Layout';

interface TaskCardProps {
    task: Task;
    onPress: (task: Task) => void;
    onCommit: (taskId: string) => void;
    // Animated props passed from Carousel
    animatedStyle?: any;
}

const getCompletionLabel = (mode: string | undefined, taskId: string) => {
    return '完了';
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onCommit, animatedStyle }) => {
    // Style based on TaskMode
    const getThemeColor = () => {
        if (task.isCompleted || task.status === 'applied') return Colors.textDim;
        switch (task.mode) {
            case 'EXPLORATION': return '#2D9CDB'; // Blue
            case 'IMMERSION': return '#00FF9D'; // Green
            case 'ORGANIZATION': return '#BD00FF'; // Purple
            case 'CONTRIBUTION': return '#FF9F1C'; // Orange
            case 'REST': return '#00F0FF'; // Cyan
            default: return '#00F0FF';
        }
    };

    const getModeLabel = (mode: string | undefined) => {
        switch (mode) {
            case 'EXPLORATION': return '探索';
            case 'IMMERSION': return '没頭';
            case 'ORGANIZATION': return '整理';
            case 'CONTRIBUTION': return '貢献';
            case 'REST': return '休息';
            default: return mode || 'TRIAL';
        }
    };

    const themeColor = getThemeColor();
    const isCompleted = task.isCompleted || task.status === 'applied';

    // Pulsing Animation
    const pulseAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
            ])
        ).start();
    }, []);

    const glowOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.9],
    });

    const glowRadius = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 30],
    });

    const glowBorder = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2],
    });

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0.5],
            extrapolate: 'clamp',
        });

        const opacity = dragX.interpolate({
            inputRange: [-100, -50, 0],
            outputRange: [1, 0.5, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.rightActionContainer}>
                <Animated.Text style={[styles.rightActionText, { transform: [{ scale }], opacity }]}>
                    {getCompletionLabel(task.mode, task.id)}
                </Animated.Text>
            </View>
        );
    };

    return (
        <Animated.View style={[styles.wrapper, animatedStyle]}>
            {!isCompleted ? (
                <Swipeable
                    renderRightActions={renderRightActions}
                    onSwipeableOpen={(direction) => {
                        if (direction === 'right') {
                            onCommit(task.id);
                        }
                    }}
                    containerStyle={{ width: '100%', height: '100%' }}
                    childrenContainerStyle={{ width: '100%', height: '100%' }}
                >
                    <AnimatedTouchableOpacity
                        onPress={() => onPress(task)}
                        activeOpacity={0.9}
                        style={[
                            styles.container,
                            {
                                borderColor: themeColor,
                                borderWidth: glowBorder,
                                shadowColor: themeColor,
                                shadowOpacity: glowOpacity,
                                shadowRadius: glowRadius,
                            },
                        ]}
                    >
                        {/* Glossy Overlay */}
                        <View style={styles.glossOverlay} />

                        {/* Header: Mode Label & Difficulty */}
                        <View style={styles.header}>
                            <View style={[styles.badge, { backgroundColor: themeColor + '20', borderColor: themeColor }]}>
                                <Text style={[styles.badgeText, { color: themeColor }]}>
                                    {getModeLabel(task.mode)}
                                </Text>
                            </View>

                            {/* Difficulty Badge */}
                            <View style={styles.difficultyContainer}>
                                <Text style={[styles.difficultyText, { color: themeColor }]}>
                                    {task.difficulty}
                                </Text>
                            </View>
                        </View>

                        {/* Content Group */}
                        <View style={styles.content}>
                            <Text
                                style={[styles.title, { color: themeColor }]}
                                numberOfLines={1}
                            >
                                {task.title}
                            </Text>
                        </View>

                        {/* Footer: Timer Only (Centered) */}
                        <View style={styles.footer}>
                            <View style={styles.timerContainer}>
                                <Ionicons name="time-outline" size={16} color={themeColor} />
                                <Text style={[styles.timerText, { color: themeColor }]}>
                                    {task.duration} min
                                </Text>
                            </View>
                        </View>
                    </AnimatedTouchableOpacity>
                </Swipeable>
            ) : (
                <TouchableOpacity
                    onPress={() => onPress(task)}
                    activeOpacity={0.9}
                    style={[
                        styles.container,
                        {
                            borderColor: Colors.textDim,
                            shadowColor: themeColor,
                        },
                        styles.completedContainer
                    ]}
                >
                    {/* Header: Mode Label & Difficulty */}
                    <View style={styles.header}>
                        <View style={[styles.badge, { backgroundColor: themeColor + '20', borderColor: themeColor }]}>
                            <Text style={[styles.badgeText, { color: themeColor }]}>
                                {getModeLabel(task.mode)}
                            </Text>
                        </View>

                        {/* Difficulty Badge */}
                        <View style={styles.difficultyContainer}>
                            <Text style={[styles.difficultyText, { color: themeColor }]}>
                                {task.difficulty}
                            </Text>
                        </View>
                    </View>

                    {/* Content Group */}
                    <View style={styles.content}>
                        <Text
                            style={[styles.title, { color: Colors.textDim }]}
                            numberOfLines={1}
                        >
                            {task.title}
                        </Text>
                    </View>

                    {/* Footer: Timer Only (Centered) */}
                    <View style={styles.footer}>
                        <View style={styles.timerContainer}>
                            <Ionicons name="time-outline" size={16} color={Colors.textDim} />
                            <Text style={[styles.timerText, { color: Colors.textDim }]}>
                                {task.duration} min
                            </Text>
                        </View>
                    </View>

                    {/* Completed Overlay Stamp */}
                    <View style={styles.overlay}>
                        <View style={styles.stamp}>
                            <Text style={styles.stampText}>{getCompletionLabel(task.mode, task.id)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        // Wrapper for Animation
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(15, 20, 35, 0.2)', // High transparency for glass effect
        borderRadius: 16,
        padding: 24,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, // Center Glow
        shadowOpacity: 0.9,
        shadowRadius: 40, // Intense glow
        elevation: 20,
        overflow: 'hidden', // Clip gloss
    },
    glossOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Full body glass tint
        borderRadius: 16,
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
    content: {
        flex: 1, // Ensure it takes available space to center vertically
        paddingVertical: 10,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28, // Restore larger title
        fontWeight: '900',
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center content
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
    difficultyContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    rightActionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 255, 157, 0.1)', // Slight Green Tint for "Success"
        borderRadius: 16,
    },
    rightActionText: {
        color: '#00FF9D',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 4,
        transform: [{ rotate: '-15deg' }],
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowRadius: 10,
    },
});
