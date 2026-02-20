import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

interface NotificationWarningModalProps {
    visible: boolean;
    pendingTime: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function NotificationWarningModal({ visible, pendingTime, onConfirm, onCancel }: NotificationWarningModalProps) {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Feather name="alert-triangle" size={24} color="#fb923c" />
                        <Text style={styles.title}>通知設定の変更</Text>
                    </View>

                    <Text style={styles.message}>
                        通知時間を <Text style={styles.highlight}>{pendingTime}</Text> に変更します。{'\n'}
                        設定変更により、本日の通知がスキップされ、次回通知が
                        <Text style={styles.highlight}> 明日 </Text>
                        になる可能性があります。
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
                            <Text style={styles.cancelText}>キャンセル</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.confirmButton]}>
                            <Text style={styles.confirmText}>変更する</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    message: {
        color: '#cbd5e1',
        lineHeight: 24,
        marginBottom: 24,
    },
    highlight: {
        color: '#fb923c',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#334155',
    },
    confirmButton: {
        backgroundColor: '#fb923c',
    },
    cancelText: {
        color: '#cbd5e1',
        fontWeight: 'bold',
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
