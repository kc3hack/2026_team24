import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur';
import MetricDetailCard, { MetricKey } from './MetricDetailCard';

interface MetricDetailModalProps {
    visible: boolean;
    onClose: () => void;
    metricKey: MetricKey;
}

export default function MetricDetailModal({ visible, onClose, metricKey }: MetricDetailModalProps) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.contentWrapper}>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Feather name="x" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                            <MetricDetailCard metricKey={metricKey} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Dark overlay
        padding: 24,
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 400,
        position: 'relative',
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 1)',
        borderRadius: 20,
    },
});
