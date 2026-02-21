import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Animated, Dimensions, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { height } = Dimensions.get('window');

interface TagSelectorProps {
    options: string[];
    selectedTags: string[];
    onToggle: (tag: string) => void;
    label: string;
    otherValue?: string;
    onOtherChange?: (text: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
    options,
    selectedTags,
    onToggle,
    label,
    otherValue = '',
    onOtherChange
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [tempValue, setTempValue] = useState('');
    const slideAnim = useRef(new Animated.Value(height)).current;
    const inputRef = useRef<TextInput>(null);

    const openModal = () => {
        setTempValue(otherValue);
        setModalVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40
        }).start();
        setTimeout(() => inputRef.current?.focus(), 100);
    };

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
        const trimmedValue = tempValue.trim();
        console.log('TagSelector: Confirming other value:', trimmedValue);

        if (trimmedValue.length > 0 && onOtherChange) {
            onOtherChange(trimmedValue);
            console.log('TagSelector: Called onOtherChange with:', trimmedValue);

            // 「その他」が選択されていない場合のみ選択状態にする
            if (!selectedTags.includes('その他')) {
                onToggle('その他');
                console.log('TagSelector: Added その他 to selection');
            }
        } else if (trimmedValue.length === 0 && onOtherChange) {
            // 空の場合は値をクリア
            onOtherChange('');
            console.log('TagSelector: Cleared other value');
        }

        closeModal();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.tagsContainer}>
                    {options.map((option) => {
                        const isSelected = selectedTags.includes(option);

                        // 「その他」の特別処理
                        if (option === 'その他') {
                            // 値が設定されている場合
                            if (otherValue && otherValue.trim().length > 0) {
                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.tag,
                                            isSelected && styles.tagSelected
                                        ]}
                                        onPress={openModal}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.tagText,
                                            isSelected && styles.tagTextSelected
                                        ]}>
                                            {otherValue}
                                        </Text>
                                        {isSelected && (
                                            <TouchableOpacity
                                                style={styles.closeButton}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    onToggle('その他');
                                                    if (onOtherChange) {
                                                        onOtherChange('');
                                                    }
                                                }}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Ionicons name="close" size={12} color={Colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                );
                            }

                            // 値が未設定の場合（デフォルト）
                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.tag,
                                        isSelected && styles.tagSelected
                                    ]}
                                    onPress={openModal}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.tagText,
                                        isSelected && styles.tagTextSelected
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.tag,
                                    isSelected && styles.tagSelected
                                ]}
                                onPress={() => onToggle(option)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.tagText,
                                    isSelected && styles.tagTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* その他入力モーダル */}
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
                            <View style={styles.handle} />
                            <Text style={styles.modalTitle}>その他を入力してください</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    ref={inputRef}
                                    style={styles.modalInput}
                                    value={tempValue}
                                    onChangeText={setTempValue}
                                    placeholder="入力..."
                                    placeholderTextColor={Colors.textDim}
                                    maxLength={20}
                                    returnKeyType="done"
                                    onSubmitEditing={handleConfirm}
                                    selectionColor={Colors.primary}
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                                    <Text style={styles.cancelText}>キャンセル</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                                    <Text style={styles.confirmText}>確定</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        color: Colors.secondary,
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 12,
        letterSpacing: 1,
    },
    scrollContent: {
        paddingRight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
        position: 'relative',
    },
    tagSelected: {
        backgroundColor: Colors.primary + '20',
        borderColor: Colors.primary,
    },
    tagText: {
        color: Colors.textDim,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    tagTextSelected: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    // Modal styles
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
        backgroundColor: '#0a0a14',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
    },
    modalInput: {
        flex: 1,
        color: Colors.text,
        fontSize: 16,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelText: {
        color: Colors.textDim,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
});
