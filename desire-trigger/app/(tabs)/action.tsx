import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, StatusBar, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { TaskCarousel } from '../../components/action/TaskCarousel';
import { TaskDetailModal } from '../../components/action/TaskDetailModal';
import { SpaceBackground } from '../../components/ui/SpaceBackground';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ActionScreen() {
    const { taskSets, completeTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [currentSetIndex, setCurrentSetIndex] = useState(0);

    const translateX = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    // 日付セットごとのdeadlineまでのカウントダウン
    useEffect(() => {
        const updateTimer = () => {
            const currentSet = taskSets[currentSetIndex];
            if (!currentSet || currentSet.tasks.length === 0) {
                setTimeLeft('--:--:--');
                return;
            }

            const now = new Date();
            const firstTask = currentSet.tasks[0];

            if (!firstTask.deadline) {
                setTimeLeft('--:--:--');
                return;
            }

            const deadline = new Date(firstTask.deadline);
            const diff = Math.max(0, deadline.getTime() - now.getTime());

            const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
            setTimeLeft(`${h}:${m}:${s}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [taskSets, currentSetIndex]);

    const handleCommit = (taskId: string) => {
        completeTask(taskId);
        setSelectedTask(null);
    };

    // ナビゲーションボタンのハンドラー
    const goToPrevSet = () => {
        if (currentSetIndex > 0) {
            setCurrentSetIndex(currentSetIndex - 1);
        }
    };

    const goToNextSet = () => {
        if (currentSetIndex < taskSets.length - 1) {
            setCurrentSetIndex(currentSetIndex + 1);
        }
    };

    // 水平スワイプハンドラー
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;

            // スワイプの閾値
            const threshold = SCREEN_WIDTH * 0.3;
            let newIndex = currentSetIndex;

            if (translationX > threshold || velocityX > 500) {
                // 右スワイプ → 前の日付セット
                newIndex = Math.max(0, currentSetIndex - 1);
            } else if (translationX < -threshold || velocityX < -500) {
                // 左スワイプ → 次の日付セット
                newIndex = Math.min(taskSets.length - 1, currentSetIndex + 1);
            }

            setCurrentSetIndex(newIndex);

            // アニメーションをリセット
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
        }
    };

    // Fade out timer when scrolling down
    const timerOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const timerTranslateY = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [0, -20],
        extrapolate: 'clamp'
    });

    const currentTasks = taskSets[currentSetIndex]?.tasks || [];

    // 日付フォーマット（MM/DD形式）
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar barStyle="light-content" />

                <View style={styles.header}>
                    <Text style={styles.headerLabel}>action</Text>
                    <Text style={styles.headerTitle}>今日のおすすめ行動</Text>
                </View>

                {/* ナビゲーションエリア（日付表示 + 左右ボタン） */}
                <View style={styles.navigationArea}>
                    {/* 左ボタン（前の日付へ） */}
                    {currentSetIndex > 0 && (
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={goToPrevSet}
                        >
                            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    )}

                    {/* 日付表示（現在のセットのみ） */}
                    {taskSets.length > 0 && taskSets[currentSetIndex] && (
                        <View style={styles.dateDisplay}>
                            <Text style={styles.dateText}>
                                {formatDate(taskSets[currentSetIndex].date)}
                            </Text>
                        </View>
                    )}

                    {/* 右ボタン（次の日付へ） */}
                    {currentSetIndex < taskSets.length - 1 && (
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={goToNextSet}
                        >
                            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Daily Countdown Timer */}
                <Animated.View
                    pointerEvents="none"
                    style={[styles.timerWrapper, { opacity: timerOpacity, transform: [{ translateY: timerTranslateY }] }]}
                >
                    <Text style={styles.timerLabel}>REMAINING_TIME</Text>
                    <Text style={styles.dailyTimer}>{timeLeft}</Text>
                </Animated.View>

                {/* タスクカード表示エリア（水平スワイプ対応） */}
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                    activeOffsetX={[-10, 10]}
                >
                    <Animated.View style={styles.carouselContainer}>
                        <TaskCarousel
                            tasks={currentTasks}
                            onTaskPress={setSelectedTask}
                            onCommit={handleCommit}
                            scrollY={scrollY}
                        />
                    </Animated.View>
                </PanGestureHandler>

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
        backgroundColor: '#050510',
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
    // ナビゲーションエリア：REMAINING_TIMEの上
    navigationArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 24, // 40 → 24 に変更（16px上に移動）
        gap: 20,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    // 日付表示
    dateDisplay: {
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    dateText: {
        fontSize: 20,
        fontFamily: 'monospace',
        color: Colors.primary,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    timerWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12, // 20 → 12 に変更（8px上に移動）
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
        color: Colors.text,
        letterSpacing: 4,
        fontWeight: '900',
        textShadowColor: Colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
