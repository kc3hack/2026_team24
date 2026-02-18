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
            <Text style={[styles.title, { color: color || Colors.primary }]}>
                {title}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 24,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});
