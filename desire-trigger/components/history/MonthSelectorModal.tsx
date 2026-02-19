import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
// BlurView import removed


interface MonthSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMonth: (date: Date) => void;
    currentDate: Date;
}

export default function MonthSelectorModal({ visible, onClose, onSelectMonth, currentDate }: MonthSelectorModalProps) {
    // Generate last 12 months for selection
    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d;
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.contentContainer} onStartShouldSetResponder={() => true}>
                    <View className="flex-row justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <Text className="text-white text-lg font-bold">月を選択</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ maxHeight: 300 }}>
                        {months.map((date, index) => {
                            const label = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
                            const isSelected = date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        onSelectMonth(date);
                                        onClose();
                                    }}
                                    className={`p-4 mb-2 rounded-xl border ${isSelected ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <Text className={`font-bold ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                                            {label}
                                        </Text>
                                        {isSelected && <Feather name="check" size={16} color="#60a5fa" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        padding: 24,
    },
    contentContainer: {
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
        maxHeight: '60%',
    }
});
