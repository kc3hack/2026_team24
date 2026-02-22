import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

type Props = {
    userName: string;
};

export default function GreetingHeader({ userName }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.headerLabel}>DASHBOARD</Text>
            <Text style={styles.headerTitle}>ステータス概要</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    headerLabel: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: Colors.textDim,
        letterSpacing: 2,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 1,
    },
});
