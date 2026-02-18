import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ColorPickerProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

const THEME_COLORS = [
    Colors.cyan,
    Colors.magenta,
    Colors.lime,
    Colors.orange,
    Colors.obsidian,
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect }) => {
    return (
        <View style={styles.container}>
            {THEME_COLORS.map((color) => (
                <TouchableOpacity
                    key={color}
                    style={[
                        styles.swatch,
                        { backgroundColor: color },
                        selectedColor === color && styles.selected
                    ]}
                    onPress={() => onSelect(color)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    swatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selected: {
        borderColor: Colors.text,
        borderWidth: 3,
    },
});
