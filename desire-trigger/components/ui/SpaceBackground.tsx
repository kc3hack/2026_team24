import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 50; // Performance vs Aesthetics balance

interface StarProps {
    startDelay: number;
    duration: number;
    size: number;
    x: number;
    y: number;
}

const Star: React.FC<StarProps> = ({ startDelay, duration, size, x, y }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.delay(startDelay),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 1,
                            duration: duration,
                            easing: Easing.sin,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0.2,
                            duration: duration,
                            easing: Easing.sin,
                            useNativeDriver: true,
                        }),
                    ])
                )
            ]).start();
        };

        animate();
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'white',
                opacity: opacity,
                shadowColor: 'white',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: size * 2,
            }}
        />
    );
};

export const SpaceBackground: React.FC = () => {
    // Generate random stars
    const stars = useRef<{ id: number; props: StarProps }[]>(
        Array.from({ length: STAR_COUNT }).map((_, i) => ({
            id: i,
            props: {
                startDelay: Math.random() * 2000,
                duration: 1500 + Math.random() * 2500, // 1.5s - 4s twinkle
                size: Math.random() * 2 + 1, // 1px - 3px
                x: Math.random() * width,
                y: Math.random() * height,
            }
        }))
    ).current;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Deep Dark Background Gradient (simulated with Views for now or just color) */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050510' }]} />

            {/* Nebula / Ambient Glow (Static for performance) */}
            <View style={{
                position: 'absolute',
                top: -100,
                left: -100,
                width: width * 1.5,
                height: width * 1.5,
                borderRadius: width,
                backgroundColor: '#1A0B2E', // Deep Purple
                opacity: 0.3,
                transform: [{ scale: 1.2 }],
            }} />
            <View style={{
                position: 'absolute',
                bottom: -100,
                right: -100,
                width: width * 1.5,
                height: width * 1.5,
                borderRadius: width,
                backgroundColor: '#001F3F', // Deep Blue
                opacity: 0.3,
                transform: [{ scale: 1.2 }],
            }} />

            {/* Stars */}
            {stars.map(star => (
                <Star key={star.id} {...star.props} />
            ))}
        </View>
    );
};
