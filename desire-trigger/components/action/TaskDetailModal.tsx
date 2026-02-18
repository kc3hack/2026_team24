import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions, Alert, Vibration, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';

interface TaskDetailModalProps {
    visible: boolean;
    task: Task | null;
    onClose: () => void;
    onCommit: (taskId: string) => void;
}

const { width } = Dimensions.get('window');

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ visible, task, onClose, onCommit }) => {
    // Local state to track "pressed" interaction
    const [isPressed, setIsPressed] = React.useState(false);

    // Animation Values
    const chargeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Reset animations when modal opens
            chargeAnim.setValue(0);
            scaleAnim.setValue(1);
            setIsPressed(false);
        }
    }, [visible]);

    if (!task) return null;

    // Check if task is already completed (passed from parent or task object)
    const isAlreadyCompleted = task.isCompleted || task.status === 'applied';

    // Interpolate background color for card glow
    const cardGlowColor = chargeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0, 240, 255, 0.2)'] // Transparent -> Neon Blue Tint
    });

    // Interpolate width for progress bar
    const progressWidth = chargeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    const handleLongPress = () => {
        // Trigger completion haptic feedback
        Vibration.vibrate([0, 50, 50, 50]); // Success pattern

        // Restore scale
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

        // Commit action
        onCommit(task.id);

        // Show confirmation alert
        Alert.alert(
            "COMMITTED",
            "プロトコルを実行しました。",
            [
                { text: "OK", onPress: onClose }
            ]
        );
    };

    const handlePressIn = () => {
        if (!isAlreadyCompleted) {
            setIsPressed(true);
            // Trigger start haptic feedback
            Vibration.vibrate(50);

            // Start charge animation
            Animated.timing(chargeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false // color/width interpolation requires false
            }).start();

            // Start scale animation
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true
            }).start();
        }
    };

    const handlePressOut = () => {
        setIsPressed(false);

        // Reset charge animation quickly
        Animated.timing(chargeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start();

        // Reset scale animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true
        }).start();
    };

    // Dynamic border color based on task type
    const accentColor = (() => {
        switch (task.levelType) {
            case 'quick': return '#00F0FF';
            case 'core': return '#FF0055';
            case 'deep': return '#FFD700';
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

                <View style={[styles.container, { borderColor: accentColor }]}>

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
                        <View style={[styles.tag, { backgroundColor: accentColor + '30', borderColor: accentColor }]}>
                            <Text style={[styles.tagText, { color: accentColor }]}>
                                {task.levelType?.toUpperCase()} :: {task.category}
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
                                    {isAlreadyCompleted ? "APPLIED" : "長押しで完了 (COMMIT)"}
                                </Text>
                                {isAlreadyCompleted && <Ionicons name="checkmark-done" size={24} color={Colors.textDim} style={{ marginLeft: 8, zIndex: 1 }} />}
                            </Pressable>
                        </Animated.View>

                        {!isAlreadyCompleted && <Text style={[styles.hintText, { color: accentColor }]}>LONG PRESS TO EXECUTE</Text>}
                    </View>
                </View>
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
        backgroundColor: 'rgba(20, 20, 40, 0.9)',
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
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
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
