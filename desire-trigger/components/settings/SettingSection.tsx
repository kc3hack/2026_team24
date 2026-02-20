import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SettingSectionProps {
    title: string;
    color?: string;
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, color }) => {
    return (
        <View style={styles.container}>
            <Text style={[styles.text, color && { color }]}>{`// ${title}`}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    text: {
        color: Colors.primary,
        fontSize: 14,
        fontFamily: 'monospace', // Assuming a monospace font is available or system default
        fontWeight: '900', // Thicker
        letterSpacing: 2, // Wider spacing
    },
});
