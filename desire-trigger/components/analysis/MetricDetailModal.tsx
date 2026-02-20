import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import MetricDetailCard, { MetricKey, METRIC_ORDER } from './MetricDetailCard';
import { Diagnostic } from '../../types';

interface MetricDetailModalProps {
    visible: boolean;
    onClose: () => void;
    metricKey: MetricKey;
    onMetricChange?: (key: MetricKey) => void;
    diagnostic?: Diagnostic | null;
}

// Loop data: [Last, ...Original, First]
const LOOPED_METRICS = [METRIC_ORDER[METRIC_ORDER.length - 1], ...METRIC_ORDER, METRIC_ORDER[0]];

export default function MetricDetailModal({ visible, onClose, metricKey, onMetricChange, diagnostic }: MetricDetailModalProps) {
    const flatListRef = useRef<FlatList>(null);
    const windowWidth = Dimensions.get('window').width;
    const cardWidth = Math.min(windowWidth - 48, 400); // Overlay padding 24*2 = 48. Max width 400.

    // Scroll to initial index when opened
    useEffect(() => {
        if (visible && flatListRef.current) {
            const index = METRIC_ORDER.indexOf(metricKey);
            if (index !== -1) {
                // +1 because of the prepended item
                const loopIndex = index + 1;
                // Use a small timeout to ensure layout is ready or list is mounted
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index: loopIndex, animated: false });
                }, 0);
            }
        }
    }, [visible, metricKey]); // Add metricKey dependency to update if it changes externally

    // Handle scroll end to update selected metric and loop if needed
    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / cardWidth);

        // Safety check for index out of bounds
        if (index < 0 || index >= LOOPED_METRICS.length) return;

        let newMetric = LOOPED_METRICS[index];

        // Loop Logic
        if (index === 0) {
            // Scrolled to Dummy Last (at start) -> Jump to Real Last
            const realLastIndex = LOOPED_METRICS.length - 2;
            flatListRef.current?.scrollToIndex({ index: realLastIndex, animated: false });
            newMetric = LOOPED_METRICS[realLastIndex];
        } else if (index === LOOPED_METRICS.length - 1) {
            // Scrolled to Dummy First (at end) -> Jump to Real First
            const realFirstIndex = 1;
            flatListRef.current?.scrollToIndex({ index: realFirstIndex, animated: false });
            newMetric = LOOPED_METRICS[realFirstIndex];
        }

        if (newMetric && newMetric !== metricKey) {
            // Only update if genuine change (avoid loops caused by snap)
            // However, triggering onMetricChange updates props, which triggers useEffect... 
            // We need to be careful not to reset scroll position on every swipe if the prop update causes re-render.
            // But useEffect depends on [visible, metricKey]. 
            // If we swipe, we call onMetricChange -> parent updates state -> metricKey prop updates -> useEffect fires -> scrolls to index.
            // This is actually Desired behavior to keep sync! 
            // The only issue is if the snap logic conflicts with the prop update.
            // But the prop update sets the Correct index.
            onMetricChange?.(newMetric);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Backdrop - Handles Tap Outside */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Content - Swipeable List */}
                <View style={[styles.contentWrapper, { width: cardWidth }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather name="x" size={24} color="#94a3b8" />
                    </TouchableOpacity>

                    <View style={{ height: 400 }}>
                        <FlatList
                            ref={flatListRef}
                            data={LOOPED_METRICS}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            getItemLayout={(data, index) => ({
                                length: cardWidth,
                                offset: cardWidth * index,
                                index,
                            })}
                            // Use initialScrollIndex only on mount. Subsequent updates handled by useEffect.
                            initialScrollIndex={METRIC_ORDER.indexOf(metricKey) + 1}
                            onMomentumScrollEnd={handleScrollEnd}
                            renderItem={({ item }) => (
                                <View style={{ width: cardWidth }}>
                                    <MetricDetailCard metricKey={item} diagnostic={diagnostic} />
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Dark overlay
    },
    contentWrapper: {
        // width handled dynamically
        maxWidth: 400,
        position: 'relative',
        zIndex: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 1)',
        borderRadius: 20,
    },
});
