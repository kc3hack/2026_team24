import React, { useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { CARD_WIDTH, ITEM_HEIGHT, SPACER_HEIGHT, VISUAL_OFFSET } from '../../constants/Layout';

interface TaskCarouselProps {
    tasks: Task[];
    onTaskPress: (task: Task) => void;
}

export const TaskCarousel: React.FC<TaskCarouselProps> = ({ tasks, onTaskPress }) => {
    const scrollY = useRef(new Animated.Value(0)).current;

    // Add spacers to top and bottom to center the items vertically
    const data = [{ id: 'top-spacer' } as any, ...tasks, { id: 'bottom-spacer' } as any];

    const renderItem = ({ item, index }: { item: Task | any, index: number }) => {
        if (!item.title) {
            return <View style={{ height: SPACER_HEIGHT }} />;
        }

        const inputRange = [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
        ];

        // Scale: Center 1.0, Ends 0.8
        const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
        });

        // Opacity: Center 1.0, Ends 0.6
        const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
        });

        // RotateX: Tilt vertically
        // Top item (prev) -> Tilt backwards (positive) or forwards?
        // Let's try standard rolodex: Top tilts away (-30deg), Bottom tilts towards (30deg)
        const rotateX = scrollY.interpolate({
            inputRange,
            outputRange: ['30deg', '0deg', '-30deg'],
            extrapolate: 'clamp',
        });

        // TranslateY: Create vertical overlap
        // Pull items towards the center
        const translateY = scrollY.interpolate({
            inputRange,
            outputRange: [-VISUAL_OFFSET, 0, VISUAL_OFFSET],
            extrapolate: 'clamp',
        });

        return (
            <View style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Animated.View
                    style={{
                        height: ITEM_HEIGHT,
                        width: CARD_WIDTH, // Keep consistent width
                        transform: [
                            { perspective: 1000 },
                            { rotateX },
                            { translateY },
                            { scale }
                        ],
                        opacity,
                        zIndex: 0,
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
                data={data}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={styles.contentContainer}
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
        justifyContent: 'center',
    },
    contentContainer: {
        alignItems: 'center',
    },
});
