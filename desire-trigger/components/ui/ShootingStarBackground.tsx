import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

// 流れ星の数
const STAR_COUNT = 15;

const ShootingStar = ({ delay }: { delay: number }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            animatedValue.setValue(0);
            Animated.timing(animatedValue, {
                toValue: 1,
                // 1.5秒〜3.5秒のランダムな速度
                duration: Math.random() * 2000 + 1500,
                delay: delay + Math.random() * 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => animate()); // ループ
        };

        animate();
    }, [animatedValue, delay]);

    // 初期位置 (画面の右上〜左下の範囲でランダム)
    const startX = Math.random() * (width * 1.5);
    const startY = Math.random() * height - height * 0.5;

    // アニメーションの距離 (斜めに移動)
    const distance = Math.max(width, height) * 1.5;

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startX, startX - distance],
    });

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startY, startY + distance],
    });

    const opacity = animatedValue.interpolate({
        inputRange: [0, 0.1, 0.8, 1],
        outputRange: [0, 1, 1, 0], // 現れて、消える
    });

    const scale = animatedValue.interpolate({
        inputRange: [0, 0.1, 0.8, 1],
        outputRange: [0, 1, 1, 0], // 大きくなって、小さくなる
    })

    return (
        <Animated.View
            style={[
                styles.starContainer,
                {
                    transform: [
                        { translateX },
                        { translateY },
                        { rotate: '-45deg' }, // 斜めの角度
                        { scale }
                    ],
                    opacity,
                },
            ]}
        >
            <View style={styles.starHead} />
            <View style={styles.starTail} />
        </Animated.View>
    );
};

export default function ShootingStarBackground() {
    // delayの配列を生成
    const starsInfo = Array.from({ length: STAR_COUNT }).map((_, i) => ({
        id: i,
        delay: Math.random() * 5000, // 0~5秒のランダムな初期遅延
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {starsInfo.map((star) => (
                <ShootingStar key={star.id} delay={star.delay} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 0, // 最背面に配置
    },
    starContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
    },
    starHead: {
        width: 3,
        height: 3,
        backgroundColor: '#fff',
        borderRadius: 1.5,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5,
    },
    starTail: {
        width: 100, // 尾の長さ
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // 薄い白
        marginLeft: -1, // headと繋げる
    },
});
