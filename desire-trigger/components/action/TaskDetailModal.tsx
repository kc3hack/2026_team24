import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions, Alert, Vibration, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';

interface TaskDetailModalProps {
    visible: boolean;
    task: Task | null;
    onClose: () => void;
    onCommit: (taskId: string) => void;
}

const { width, height } = Dimensions.get('window');

const getModeLabel = (mode: string | undefined) => {
    switch (mode) {
        case 'EXPLORATION': return '探索';
        case 'IMMERSION': return '没頭';
        case 'ORGANIZATION': return '整理';
        case 'CONTRIBUTION': return '貢献';
        case 'REST': return '休息';
        default: return mode || 'TEST';
    }
};

const Scanline: React.FC<{ height: number; color: string }> = ({ height, color }) => {
    const scan = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(scan, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateY = scan.interpolate({
        inputRange: [0, 1],
        outputRange: [0, height],
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4, // Thicker beam
                backgroundColor: color,
                opacity: 0.3,
                transform: [{ translateY }],
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 10,
                zIndex: 10,
            }}
        />
    );
};

const MODE_COMPLETION_LABELS: Record<string, string[]> = {
    EXPLORATION: ['獲得'],
    IMMERSION: ['覚醒'],
    ORGANIZATION: ['最適化'],
    CONTRIBUTION: ['創出'],
    REST: ['充填'],
};

const getCompletionLabel = (mode: string | undefined, taskId: string) => {
    const labels = MODE_COMPLETION_LABELS[mode || 'EXPLORATION'] || ['達成', '完了', '突破'];
    let hash = 0;
    for (let i = 0; i < taskId.length; i++) {
        hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % labels.length;
    return labels[index];
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ visible, task, onClose, onCommit }) => {
    // Local state to track interaction
    const [isPressed, setIsPressed] = React.useState(false);
    const [isLaunching, setIsLaunching] = React.useState(false);

    // Animation Values
    const chargeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rocketAnim = useRef(new Animated.Value(0)).current; // 0 (Base) -> 1 (Launched)
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (visible) {
            // Reset animations when modal opens
            chargeAnim.setValue(0);
            scaleAnim.setValue(1);
            rocketAnim.setValue(0);
            shakeAnim.setValue(0);
            setIsPressed(false);
            setIsLaunching(false);

            // Start Pulse Loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
                    Animated.timing(pulseAnim, { toValue: 0.5, duration: 1500, useNativeDriver: false }),
                ])
            ).start();
        }
    }, [visible]);

    if (!task) return null;

    // Check if task is already completed
    const isAlreadyCompleted = task.isCompleted || task.status === 'applied';

    // Interpolate background color for card glow
    const cardGlowColor = chargeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0, 240, 255, 0.4)']
    });

    // Interpolate width for progress bar
    const progressWidth = chargeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    // Rocket Physics
    const rocketTranslateY = rocketAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height], // Fly off screen
    });

    const rocketScale = chargeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1.5], // Grow while charging
    });

    const handleLongPress = () => {
        if (isAlreadyCompleted || isLaunching) return;
        setIsLaunching(true);

        // 1. Success Vibration
        Vibration.vibrate([0, 50, 50, 50, 100, 200]); // intense pattern

        // 2. Launch Animation
        Animated.timing(rocketAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.ease, // Safe standard easing
            useNativeDriver: true
        }).start(({ finished }) => {
            if (finished) {
                // 3. Commit Action
                onCommit(task.id);

                // 4. Close Modal (Rocket has flown away)
                setTimeout(() => {
                    onClose();
                }, 300);
            }
        });
    };

    const handlePressIn = () => {
        if (!isAlreadyCompleted && !isLaunching) {
            setIsPressed(true);
            Vibration.vibrate(50);

            // Start Charge
            Animated.timing(chargeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false
            }).start();

            // Start Shake Loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                ])
            ).start();

            // Button Scale
            Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
        }
    };

    const handlePressOut = () => {
        if (isLaunching) return; // Don't cancel if already launched

        setIsPressed(false);
        shakeAnim.stopAnimation();
        shakeAnim.setValue(0);

        // Reset Charge
        Animated.timing(chargeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start();

        // Reset Scale
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    // Dynamic border color
    const accentColor = (() => {
        switch (task.mode) {
            case 'EXPLORATION': return '#2D9CDB';
            case 'IMMERSION': return '#00FF9D';
            case 'ORGANIZATION': return '#BD00FF';
            case 'CONTRIBUTION': return '#FF9F1C';
            case 'REST': return '#00F0FF';
            default: return '#00F0FF';
        }
    })();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>

                <Animated.View style={[
                    styles.container,
                    {
                        borderColor: accentColor,
                        shadowColor: accentColor,
                        shadowOpacity: pulseAnim, // Pulsing Glow
                        shadowRadius: pulseAnim.interpolate({
                            inputRange: [0.5, 1],
                            outputRange: [20, 50]
                        })
                    }
                ]}>
                    <Scanline height={450} color={accentColor} />

                    {/* Interior Card Glow Effect */}
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFillObject,
                            { backgroundColor: cardGlowColor, borderRadius: 4 }
                        ]}
                        pointerEvents="none"
                    />

                    {/* Decorative Corner Lines */}
                    <View style={[styles.corner, styles.cornerTL, { borderColor: accentColor }]} />
                    <View style={[styles.corner, styles.cornerTR, { borderColor: accentColor }]} />
                    <View style={[styles.corner, styles.cornerBL, { borderColor: accentColor }]} />
                    <View style={[styles.corner, styles.cornerBR, { borderColor: accentColor }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[
                            styles.flashyTag,
                            {
                                borderColor: accentColor,
                                shadowColor: accentColor
                            }
                        ]}>
                            <View style={[styles.flashyTagBg, { backgroundColor: accentColor }]} />
                            <Ionicons name="flash" size={14} color="#000" style={{ marginRight: 4 }} />
                            <Text style={[styles.flashyTagText, { color: '#000' }]}>
                                {getModeLabel(task.mode)}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle-outline" size={32} color={accentColor} />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: accentColor }]}>{task.title}</Text>

                    {/* AI Description Box */}
                    <View style={[styles.aiBox, { borderLeftColor: accentColor }]}>
                        <View style={styles.aiHeader}>
                            <Ionicons name="hardware-chip-outline" size={16} color={accentColor} />
                            <Text style={[styles.aiLabel, { color: accentColor }]}>AI ANALYSIS</Text>
                        </View>
                        <Text style={[styles.description, { color: 'rgba(255,255,255,0.9)' }]}>
                            {task.description}
                        </Text>
                    </View>

                    {/* Action Button */}
                    <View style={styles.footer}>
                        <Animated.View style={{ width: '100%', transform: [{ scale: scaleAnim }] }}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.commitButton,
                                    { borderColor: accentColor },
                                    isAlreadyCompleted && {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderColor: Colors.textDim,
                                    }
                                ]}
                                onLongPress={handleLongPress}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                delayLongPress={1000}
                                disabled={isAlreadyCompleted}
                            >
                                {/* Progress Bar Background */}
                                {!isAlreadyCompleted && (
                                    <Animated.View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                width: progressWidth,
                                                backgroundColor: accentColor,
                                                opacity: 0.4
                                            }
                                        ]}
                                    />
                                )}

                                <Text style={[styles.commitText, { color: isAlreadyCompleted ? Colors.textDim : accentColor }]}>
                                    {isAlreadyCompleted ? getCompletionLabel(task.mode, task.id) : "長押しで完了 (COMMIT)"}
                                </Text>
                                {isAlreadyCompleted && <Ionicons name="checkmark-done" size={24} color={Colors.textDim} style={{ marginLeft: 8, zIndex: 1 }} />}
                            </Pressable>
                        </Animated.View>

                        {!isAlreadyCompleted && <Text style={[styles.hintText, { color: accentColor }]}>LONG PRESS TO EXECUTE</Text>}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(5, 5, 16, 0.95)', // Deep dark overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        width: '100%',
        backgroundColor: 'rgba(15, 20, 35, 0.85)', // Glassy Space Theme
        borderRadius: 4, // Sharp corners for Cyberpunk feel
        borderWidth: 1,
        padding: 24,
        position: 'relative',
        minHeight: 450,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    // Decorative Corners
    corner: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderWidth: 0,
    },
    cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3 },
    cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3 },
    cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3 },
    cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    flashyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        transform: [{ skewX: '-15deg' }], // Cyberpunk Skew
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    flashyTagBg: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9,
    },
    flashyTagText: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    closeButton: {
        marginTop: -4,
        marginRight: -4,
        padding: 4,
    },
    title: {
        fontSize: 32, // Larger title
        fontWeight: '900',
        lineHeight: 40,
        marginBottom: 24,
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    aiBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderLeftWidth: 2,
        padding: 16,
        marginBottom: 32,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    aiLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    commitButton: {
        height: 60, // Enforced height
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: 2,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        overflow: 'hidden', // Ensure progress bar stays inside
        width: '100%',
    },
    commitText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
        zIndex: 1, // Ensure text is above progress bar
    },
    hintText: {
        fontSize: 10,
        letterSpacing: 2,
        opacity: 0.8,
        marginTop: 12,
        textAlign: 'center',
    },
});
