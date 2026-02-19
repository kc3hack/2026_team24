import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withDelay,
    withSequence,
    withRepeat,
    Easing,
    interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// 🌟 背景の瞬く星
const TwinklingStar = ({ x, y, size }: { x: number, y: number, size: number }) => {
    const opacity = useSharedValue(Math.random() * 0.5 + 0.5);
    useEffect(() => {
        opacity.value = withRepeat(withSequence(
            withTiming(1, { duration: 1000 + Math.random() * 1000 }),
            withTiming(0.2, { duration: 1000 + Math.random() * 1000 })
        ), -1, true);
    }, []);
    const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));
    return <AnimatedCircle cx={x} cy={y} r={size} fill="#FFF" animatedProps={animatedProps} />;
};

// 🌠 流れ星コンポーネント（一定確率で降る）
const ShootingStar = ({ delay, startX, startY }: { delay: number, startX: number, startY: number }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        // 4秒周期。delayでスタート時間をずらすことでランダムに降っているように見せる
        progress.value = withDelay(
            delay,
            withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false)
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        // 0〜0.15 の短い間だけ移動する
        const p = interpolate(progress.value, [0, 0.15], [0, 1], 'clamp');

        const currentX = startX - p * width * 1.5;
        const currentY = startY + p * width * 1.5;
        const tailLength = interpolate(p, [0, 0.5, 1], [0, 120, 0], 'clamp');

        return {
            x1: currentX,
            y1: currentY,
            x2: currentX + tailLength,
            y2: currentY - tailLength,
            opacity: interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0], 'clamp'),
        };
    });

    return (
        <AnimatedLine stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" animatedProps={animatedProps} />
    );
};

export default function StarryBackground() {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height={height} width={width}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <TwinklingStar key={`star-${i}`} x={Math.random() * width} y={Math.random() * height} size={Math.random() * 1.5 + 0.5} />
                ))}
                {/* 🚀 流れ星を追加（時間差でランダムに降る） */}
                <ShootingStar delay={1000} startX={width * 0.8} startY={-100} />
                <ShootingStar delay={2500} startX={width * 1.2} startY={height * 0.2} />
                <ShootingStar delay={4000} startX={width * 0.5} startY={-200} />
                <ShootingStar delay={5500} startX={width * 1.5} startY={height * 0.4} />
            </Svg>
        </View>
    );
}
