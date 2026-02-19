import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, LayoutAnimation, Keyboard, Platform, UIManager, Modal, Animated, Dimensions, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height } = Dimensions.get('window');

type Props = {
    options: string[];
    selectedItems: string[];
    onSelect: (items: string[]) => void;
    otherValue: string;
    onOtherChange: (text: string) => void;
    // Note: multiSelect is assumed implicitly for Steps 3 & 4
};

export default function SelectionGrid({ options, selectedItems, onSelect, otherValue, onOtherChange }: Props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [tempValue, setTempValue] = useState('');
    const slideAnim = useRef(new Animated.Value(height)).current;
    const inputRef = useRef<TextInput>(null);

    // Handle selection (Toggle for multi-select)
    const handleSelect = (option: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Check if item is already selected
        if (selectedItems.includes(option)) {
            // Remove
            onSelect(selectedItems.filter(item => item !== option));
        } else {
            // Add
            onSelect([...selectedItems, option]);
        }
    };

    // Open Modal for "Other"
    const openModal = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTempValue(otherValue); // Pre-fill with existing value
        setModalVisible(true);
        // Animate Up
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40
        }).start();

        // Focus input after animation starts
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Close Modal
    const closeModal = () => {
        Keyboard.dismiss();
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 250,
            useNativeDriver: true
        }).start(() => {
            setModalVisible(false);
            setTempValue('');
        });
    };

    const handleConfirm = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (tempValue.trim().length > 0) {
            onOtherChange(tempValue);
            // Ensure "その他" is selected if valid input provided
            if (!selectedItems.includes('その他')) {
                onSelect([...selectedItems, 'その他']);
            }
        }
        closeModal();
    };

    return (
        <View style={styles.container}>

            {/* Grid Zone */}
            <View style={styles.gridContainer}>
                {options.map((opt) => {

                    // Special Render for "Other"
                    if (opt === 'その他') {
                        const isSelected = selectedItems.includes('その他');

                        // Show value if set, regardless of selection status
                        if (otherValue) {
                            return (
                                <Pressable
                                    key={opt}
                                    style={[
                                        styles.itemBase,
                                        isSelected && styles.itemSelected
                                    ]}
                                    onPress={openModal} // Allow editing regardless of selection
                                >
                                    <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
                                        {otherValue}
                                    </Text>

                                    {/* Close Button */}
                                    {isSelected && (
                                        <Pressable
                                            style={styles.closeButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                // Remove 'その他' from selection
                                                const newSelection = selectedItems.filter(i => i !== 'その他');
                                                onSelect(newSelection);
                                            }}
                                            hitSlop={8}
                                        >
                                            <Feather name="x" size={12} color="white" />
                                        </Pressable>
                                    )}
                                </Pressable>
                            );
                        }

                        // Default "+ Others" mode (No value set)
                        return (
                            <Pressable
                                key={opt}
                                style={[styles.itemBase, isSelected && styles.itemSelected]}
                                onPress={openModal}
                            >
                                <Text style={isSelected ? styles.iconSelected : styles.icon}>
                                    {isSelected ? '' : '+'}
                                </Text>
                                <Text style={[styles.label, isSelected && styles.labelSelected]}>その他</Text>
                            </Pressable>
                        );
                    }

                    // Standard Options
                    const isSelected = selectedItems.includes(opt);
                    return (
                        <Pressable
                            key={opt}
                            style={[
                                styles.itemBase,
                                isSelected && styles.itemSelected
                            ]}
                            onPress={() => handleSelect(opt)}
                        >
                            {/* Label */}
                            <Text style={[styles.label, isSelected && styles.labelSelected]}>{opt}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Modal */}
            <Modal
                transparent
                visible={modalVisible}
                animationType="none"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>

                            {/* Drag Handle */}
                            <View style={styles.handle} />

                            {/* Title */}
                            <Text style={styles.modalTitle}>その他を入力してください</Text>

                            {/* Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.iconSelected}>✦</Text>
                                <TextInput
                                    ref={inputRef}
                                    style={styles.modalInput}
                                    value={tempValue}
                                    onChangeText={setTempValue}
                                    placeholder="入力..."
                                    placeholderTextColor="#64748b" // Slate-500
                                    maxLength={11}
                                    returnKeyType="done"
                                    onSubmitEditing={handleConfirm}
                                    selectionColor="#60A5FA"
                                />
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttonRow}>
                                <Pressable onPress={closeModal} style={styles.cancelButton}>
                                    <Text style={styles.cancelText}>キャンセル</Text>
                                </Pressable>

                                <Pressable onPress={handleConfirm} style={styles.confirmButton}>
                                    <Text style={styles.confirmText}>確定</Text>
                                </Pressable>
                            </View>

                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 40,
        justifyContent: 'flex-start',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    // Base Item Style
    itemBase: {
        width: '48%', // 2 columns
        height: height * 0.085, // Dynamic height (approx 8.5%)
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.6)', // Slate-800 translucent
    },
    itemSelected: {
        borderWidth: 1,
        borderColor: '#FBBF24', // Amber-400 (Gold)
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        shadowColor: '#60A5FA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        color: '#94a3b8', // Gray-400
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        flexShrink: 1,
    },
    labelSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    icon: {
        color: '#6B7280', // Gray-500
        marginRight: 6,
        fontSize: 18,
        fontWeight: '500',
    },
    iconSelected: {
        color: '#FBBF24', // Amber-400 (Gold)
        marginRight: 6,
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    keyboardView: {
        width: '100%',
    },
    bottomSheet: {
        backgroundColor: '#0f172a', // Match app background (Slate-900)
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        width: '100%',
        // Border top for definition
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#334155', // Slate-700
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b', // Slate-800
        borderWidth: 1,
        borderColor: '#60A5FA', // Blue glow for input
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
        shadowColor: '#60A5FA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    modalInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 30,
        backgroundColor: '#334155', // Slate-700
    },
    cancelText: {
        color: '#cbd5e1',
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        marginLeft: 10,
        borderRadius: 30,
        backgroundColor: '#3B82F6', // Blue-500
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(51, 65, 85, 0.8)', // Slate-700
        borderRadius: 12,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    }
});
