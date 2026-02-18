import React, { useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { ITEM_HEIGHT, SPACER_HEIGHT, SCREEN_WIDTH } from '../../constants/Layout';

interface TaskCarouselProps {
    tasks: Task[];
    onTaskPress: (task: Task) => void;
}

export const TaskCarousel: React.FC<TaskCarouselProps> = ({ tasks, onTaskPress }) => {
    const scrollY = useRef(new Animated.Value(0)).current;

    const renderItem = ({ item, index }: { item: Task, index: number }) => {
        const inputRange = [
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
        ];

        // Scale: Center 1.0, Ends 0.85
        const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
        });

        // Opacity: Center 1.0, Ends 0.6
        const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
        });

        // RotateZ: Fan effect (Tilt left/right)
        const rotateZ = scrollY.interpolate({
            inputRange,
            outputRange: ['-15deg', '0deg', '15deg'],
            extrapolate: 'clamp',
        });

        // TranslateX: Slide out slightly to emphasize fan
        const translateX = scrollY.interpolate({
            inputRange,
            outputRange: [-40, 0, 40],
            extrapolate: 'clamp',
        });

        // TranslateY: Slight vertical stacking
        const translateY = scrollY.interpolate({
            inputRange,
            outputRange: [-20, 0, 20],
            extrapolate: 'clamp',
        });

        return (
            <View style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH }}>
                <Animated.View
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        transform: [
                            { perspective: 1000 },
                            { translateY },
                            { translateX },
                            { rotateZ },
                            { scale }
                        ],
                        opacity,
                        zIndex: 1, // Visual interaction handled by transform order
                    }}
                >
                    <TaskCard
                        task={item}
                        onPress={() => onTaskPress(item)}
                    />
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                // Add vertical padding evenly to center first and last items
                contentContainerStyle={{
                    paddingTop: SPACER_HEIGHT,
                    paddingBottom: SPACER_HEIGHT,
                    alignItems: 'center',
                }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Container handles layout
    },
});
