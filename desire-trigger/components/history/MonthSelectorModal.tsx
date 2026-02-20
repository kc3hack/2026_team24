import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
// BlurView import removed


interface MonthSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMonth: (date: Date) => void;
    currentDate: Date;
    availableMonths?: string[]; // YYYY-MM 形式の配列
}

export default function MonthSelectorModal({ visible, onClose, onSelectMonth, currentDate, availableMonths }: MonthSelectorModalProps) {
    // 履歴がある月 + 今月のみを表示
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // availableMonths がある場合はそれを使用、ない場合は過去12ヶ月
    let months: Date[];

    if (availableMonths && availableMonths.length > 0) {
        // availableMonths + 現在の月を Date オブジェクトに変換
        const monthSet = new Set([...availableMonths, currentYearMonth]);
        months = Array.from(monthSet)
            .map(ym => {
                const [year, month] = ym.split('-').map(Number);
                const d = new Date(year, month - 1, 1);
                return d;
            })
            .sort((a, b) => b.getTime() - a.getTime()); // 降順（新しい順）
    } else {
        // フォールバック: 現在の月のみ
        months = [new Date()];
    }

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
