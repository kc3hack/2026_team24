import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { CARD_WIDTH, CARD_HEIGHT } from '../../constants/Layout';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

interface TaskStackProps {
    tasks: Task[];
    onTaskPress: (task: Task) => void;
    onCommit: (taskId: string) => void;
}

export const TaskStack: React.FC<TaskStackProps> = ({ tasks, onTaskPress, onCommit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (e, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    forceSwipe('right');
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    forceSwipe('left');
                } else {
                    resetPosition();
                }
            },
        })
    ).current;

    const forceSwipe = (direction: 'right' | 'left') => {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(pan, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => onSwipeComplete());
    };

    const onSwipeComplete = () => {
        pan.setValue({ x: 0, y: 0 });
        setCurrentIndex((prev) => prev + 1);
    };

    const resetPosition = () => {
        Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
        }).start();
    };

    if (currentIndex >= tasks.length) {
        return (
            <View style={styles.container}>
                {/* Empty State or Reset? For now, nothing or maybe a reset button in parent */}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {tasks.map((task, index) => {
                const relativeIndex = index - currentIndex;

                // Optimization: Don't render cards that are swiped or too far back
                if (relativeIndex < 0 || relativeIndex > 2) return null;

                const isTop = relativeIndex === 0;

                const panHandlers = isTop ? panResponder.panHandlers : {};

                // Animated Style
                const animatedStyle = isTop ? {
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                        { rotate: pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-10deg', '0deg', '10deg'] }) }
                    ],
                    zIndex: tasks.length - index,
                } : {
                    top: relativeIndex * 20, // Shift down
                    transform: [{ scale: 1 - relativeIndex * 0.05 }], // Scale down
                    zIndex: tasks.length - index,
                    opacity: 1 - relativeIndex * 0.2, // Fade out
                };

                return (
                    <Animated.View
                        key={task.id}
                        style={[styles.cardWrapper, animatedStyle]}
                        {...panHandlers}
                    >
                        <TaskCard
                            task={task}
                            onPress={() => onTaskPress(task)}
                            onCommit={onCommit}
                        />
                    </Animated.View>
                );
            }).reverse()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardWrapper: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});
