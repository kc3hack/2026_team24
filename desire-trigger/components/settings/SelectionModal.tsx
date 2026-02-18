import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface SettingOption {
    label: string;
    value: string;
}

interface SelectionModalProps {
    visible: boolean;
    title: string;
    options: SettingOption[];
    currentValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    themeColor?: string;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
    visible, title, options, currentValue, onSelect, onClose, themeColor = Colors.primary
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, { borderColor: themeColor }]}>
                            <View style={[styles.header, { borderBottomColor: themeColor }]}>
                                <Text style={[styles.headerTitle, { color: themeColor }]}>{title}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={Colors.secondary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => {
                                    const isSelected = item.value === currentValue;
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.optionItem,
                                                isSelected && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                                            ]}
                                            onPress={() => {
                                                onSelect(item.value);
                                                onClose();
                                            }}
                                        >
                                            <Text style={[
                                                styles.optionLabel,
                                                isSelected && { color: themeColor, fontWeight: 'bold' }
                                            ]}>
                                                {item.label}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={20} color={themeColor} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for focus
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: '70%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    optionLabel: {
        color: Colors.text,
        fontSize: 16,
        fontFamily: 'monospace',
    },
});
