import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ColorPicker } from './ColorPicker';
import { IconSelector } from './IconSelector';

interface SettingItemProps {
    label: string;
    value?: string | boolean;
    type: 'switch' | 'text' | 'button' | 'color_picker' | 'icon_selector' | 'input' | 'select' | 'time';
    description?: string;
    onPress?: () => void;
    danger?: boolean;
    disabled?: boolean;
    // Extra props for specific types
    selectedColor?: string;
    onColorSelect?: (color: string) => void;
    currentIcon?: string;
    onIconSelect?: (icon: string) => void;
    onChangeText?: (text: string) => void;
}

export const SettingItem: React.FC<SettingItemProps> = ({
    label, value, type, description, onPress, danger, disabled,
    selectedColor, onColorSelect, currentIcon, onIconSelect, onChangeText
}) => {
    const themeColor = selectedColor || Colors.primary;

    if (type === 'color_picker') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label, { color: themeColor }]}>{label}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
                <ColorPicker
                    selectedColor={themeColor}
                    onSelect={onColorSelect || (() => { })}
                />
            </View>
        );
    }

    if (type === 'icon_selector') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label, { color: themeColor }]}>{label}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
                <IconSelector
                    currentIcon={currentIcon || 'DEFAULT'}
                    onSelect={onIconSelect || (() => { })}
                />
            </View>
        );
    }

    if (type === 'input') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label, { color: themeColor }]}>{label}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
                <TextInput
                    style={[styles.input, { borderColor: themeColor }]}
                    value={String(value)}
                    onChangeText={onChangeText}
                    placeholderTextColor={Colors.textDim}
                    selectionColor={themeColor}
                />
            </View>
        );
    }

    // Common container for pressable items
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            disabled={type === 'switch' || type === 'text' || disabled}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={[
                        styles.label,
                        danger && styles.dangerLabel,
                        (selectedColor && !danger) && { color: themeColor }
                    ]}>
                        {label}
                    </Text>
                    {description && <Text style={styles.description}>{description}</Text>}
                </View>

                {type === 'text' && value && (
                    <Text style={styles.value}>{String(value)}</Text>
                )}

                {type === 'switch' && (
                    <Switch
                        value={value as boolean}
                        onValueChange={onPress}
                        trackColor={{ false: Colors.border, true: themeColor }}
                        thumbColor={Colors.text}
                    />
                )}

                {/* Select/Time/Button show chevron or value */}
                {(type === 'select' || type === 'time') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.value}>{String(value)}</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textDim} style={{ marginLeft: 8 }} />
                    </View>
                )}

                {type === 'button' && !danger && (
                    <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    dangerLabel: {
        color: Colors.danger,
    },
    description: {
        color: Colors.textDim,
        fontSize: 12,
        marginTop: 4,
    },
    value: {
        color: Colors.textDim,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    input: {
        color: Colors.text,
        fontSize: 16,
        borderBottomWidth: 1,
        paddingVertical: 8,
        marginTop: 8,
        fontFamily: 'monospace',
    },
});
