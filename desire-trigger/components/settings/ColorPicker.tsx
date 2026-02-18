import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ColorPickerProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

const THEME_COLORS = [
    { id: 'CYBER_BLUE', value: '#00F0FF' },
    { id: 'NEON_PINK', value: '#FF003C' },
    { id: 'ACID_GREEN', value: '#39FF14' },
    { id: 'SOLAR_YELLOW', value: '#FDF500' },
    { id: 'PLASMA_PURPLE', value: '#8A2BE2' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect }) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {THEME_COLORS.map((color) => {
                    const isSelected = selectedColor === color.value;
                    return (
                        <TouchableOpacity
                            key={color.id}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: color.value },
                                isSelected && styles.selectedCircle
                            ]}
                            onPress={() => onSelect(color.value)}
                            activeOpacity={0.7}
                        >
                            {isSelected && <View style={styles.innerDot} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
    },
    scrollContent: {
        paddingHorizontal: 0,
        alignItems: 'center',
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCircle: {
        borderColor: Colors.text,
    },
    innerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.background,
    },
});
