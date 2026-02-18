import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface IconSelectorProps {
    currentIcon: string;
    onSelect: (icon: string) => void;
}

const ICONS = [
    { id: 'DEFAULT', label: 'Default', color: Colors.cyan, icon: 'layers' },
    { id: 'NEON', label: 'Neon', color: Colors.cyan, icon: 'flash' },
    { id: 'CRIMSON', label: 'Crimson', color: Colors.danger, icon: 'flame' },
    { id: 'OBSIDIAN', label: 'Obsidian', color: Colors.obsidian, icon: 'cube' },
];

export const IconSelector: React.FC<IconSelectorProps> = ({ currentIcon, onSelect }) => {
    return (
        <View style={styles.container}>
            {ICONS.map((item) => {
                const isSelected = currentIcon === item.id;
                return (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.item,
                            isSelected && { borderColor: item.color, backgroundColor: item.color + '20' }
                        ]}
                        onPress={() => onSelect(item.id)}
                    >
                        <Ionicons name={item.icon as any} size={24} color={isSelected ? item.color : Colors.textDim} />
                        <Text style={[styles.label, isSelected && { color: item.color }]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 8,
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        width: '23%',
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        color: Colors.textDim,
    },
});
