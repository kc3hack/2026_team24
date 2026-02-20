import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

interface IconSelectorProps {
    currentIcon: string;
    onSelect: (id: string) => void;
}

const ICONS = [
    { id: 'DEFAULT', color: '#0D1117' },
    { id: 'NEON', color: '#00F0FF' },
    { id: 'OBSIDIAN', color: '#161B22' },
    { id: 'CRIMSON', color: '#DA3633' },
];

export const IconSelector: React.FC<IconSelectorProps> = ({ currentIcon, onSelect }) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {ICONS.map((icon) => {
                    const isSelected = currentIcon === icon.id;
                    return (
                        <TouchableOpacity
                            key={icon.id}
                            style={[
                                styles.iconItem,
                                isSelected && styles.selectedItem,
                                !isSelected && styles.unselectedItem
                            ]}
                            onPress={() => onSelect(icon.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconPreview, { backgroundColor: icon.color }]} />
                            <Text style={[styles.iconLabel, isSelected && styles.selectedLabel]}>
                                {isSelected ? 'CONNECTED' : icon.id}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    iconItem: {
        alignItems: 'center',
        marginRight: 16,
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedItem: {
        borderColor: '#00F0FF',
        backgroundColor: 'rgba(0, 240, 255, 0.05)',
    },
    unselectedItem: {
        opacity: 0.5,
    },
    iconPreview: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconLabel: {
        color: Colors.secondary,
        fontSize: 10,
        fontFamily: 'monospace',
        letterSpacing: 0.5,
    },
    selectedLabel: {
        color: '#00F0FF',
        fontWeight: 'bold',
    },
});
