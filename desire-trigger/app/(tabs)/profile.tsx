import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
    const router = useRouter();

    const MOCK_USER = {
        name: 'Kubo_J',
        title: 'ネットランナー',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
        stats: [
            { label: 'ストリーク', value: '12' },
            { label: '集中度', value: '88%' },
        ]
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image
                            style={styles.avatar} // Changed to style prop for expo-image compatibility or React Native Image
                            source={{ uri: MOCK_USER.avatar }}
                            contentFit="cover"
                            transition={1000}
                        />
                        <View style={styles.statusBadge} />
                    </View>
                    <Text style={styles.name}>{MOCK_USER.name}</Text>
                    <Text style={styles.title}>{MOCK_USER.title}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    {MOCK_USER.stats.map((stat, index) => (
                        <View key={index} style={styles.statBox}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Menu Section */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/settings')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemContent}>
                            <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                            <Text style={styles.menuItemText}>システム設定</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
                    </TouchableOpacity>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 60,
        padding: 4,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.secondary,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.accent,
        borderWidth: 2,
        borderColor: Colors.background,
    },
    name: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
    title: {
        color: Colors.secondary,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 40,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'rgba(88, 166, 255, 0.1)',
        marginHorizontal: 4,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(88, 166, 255, 0.3)',
    },
    statValue: {
        color: Colors.primary,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    statLabel: {
        color: Colors.secondary,
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 1,
    },
    menuContainer: {
        width: '90%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.glass,
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        color: Colors.text,
        fontSize: 16,
        marginLeft: 12,
        fontFamily: 'monospace',
        fontWeight: '600',
    },
});
