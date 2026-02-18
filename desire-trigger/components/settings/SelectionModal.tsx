import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export type SettingOption = {
    label: string;
    value: string;
    description?: string;
};

interface SelectionModalProps {
    visible: boolean;
    title: string;
    options: SettingOption[];
    currentValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    themeColor: string;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
    visible, title, options, currentValue, onSelect, onClose, themeColor
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { borderColor: themeColor, shadowColor: themeColor }]}>
                    <Text style={[styles.title, { color: themeColor }]}>{title}</Text>

                    <ScrollView style={styles.optionList}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionItem,
                                    currentValue === option.value && { backgroundColor: themeColor + '20' }
                                ]}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                            >
                                <View style={styles.labelContainer}>
                                    <Text style={[
                                        styles.optionLabel,
                                        currentValue === option.value && { color: themeColor, fontWeight: 'bold' }
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {option.description && (
                                        <Text style={styles.optionDescription}>{option.description}</Text>
                                    )}
                                </View>
                                {currentValue === option.value && (
                                    <Ionicons name="checkmark" size={20} color={themeColor} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: '70%',
        padding: 20,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    optionList: {
        marginBottom: 16,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    labelContainer: {
        flex: 1,
    },
    optionLabel: {
        color: Colors.text,
        fontSize: 16,
    },
    optionDescription: {
        color: Colors.textDim,
        fontSize: 12,
        marginTop: 2,
    },
    closeButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    closeText: {
        color: Colors.text,
        fontWeight: 'bold',
    },
});
