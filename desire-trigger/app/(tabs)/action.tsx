import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { TaskCarousel } from '../../components/action/TaskCarousel';
import { TaskDetailModal } from '../../components/action/TaskDetailModal';
import { SpaceBackground } from '../../components/ui/SpaceBackground';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types';

export default function ActionScreen() {
    const { tasks, completeTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const diff = Math.max(0, end.getTime() - now.getTime());

            const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
            setTimeLeft(`${h}:${m}:${s}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCommit = (taskId: string) => {
        completeTask(taskId);
        setSelectedTask(null);
    };

    // Fade out timer when scrolling down
    const timerOpacity = scrollY.interpolate({
        inputRange: [0, 60], // Fade out quickly
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const timerTranslateY = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [0, -20],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar barStyle="light-content" />

                <View style={styles.header}>
                    <Text style={styles.headerLabel}>action</Text>
                    <Text style={styles.headerTitle}>今日のおすすめ行動</Text>
                </View>

                {/* Daily Countdown Timer */}
                <Animated.View
                    pointerEvents="none"
                    style={[styles.timerWrapper, { opacity: timerOpacity, transform: [{ translateY: timerTranslateY }] }]}
                >
                    <Text style={styles.timerLabel}>REMAINING_TIME</Text>
                    <Text style={styles.dailyTimer}>{timeLeft}</Text>
                </Animated.View>

                <View style={styles.carouselContainer}>
                    <TaskCarousel
                        tasks={tasks}
                        onTaskPress={setSelectedTask}
                        onCommit={handleCommit}
                        scrollY={scrollY}
                    />
                </View>

                <TaskDetailModal
                    visible={!!selectedTask}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onCommit={handleCommit}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510', // Fallback color
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
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
    timerWrapper: {
        position: 'absolute',
        top: 180, // Moved further down
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    timerLabel: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: Colors.textDim,
        letterSpacing: 4,
        marginBottom: 4,
    },
    dailyTimer: {
        fontSize: 52,
        fontFamily: 'monospace',
        color: Colors.text, // Bright text
        letterSpacing: 4,
        fontWeight: '900',
        textShadowColor: Colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10, // Neon glow
    },
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // Pure centering for Card Stack
    },
});
