import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { MOCK_SETTINGS } from '../../constants/mockData';
import { useDataModeStore } from '../../store/dataModeStore';
import { SpaceBackground } from '../../components/ui/SpaceBackground';

export default function ProfileScreen() {
    const router = useRouter();
    const { dataMode } = useDataModeStore();

    const [name, setName] = useState('');
    const [displayTech, setDisplayTech] = useState('');
    const [displayHobbies, setDisplayHobbies] = useState('');
    const [displayWorries, setDisplayWorries] = useState('');
    const [displayNotifTime, setDisplayNotifTime] = useState('');

    // 画面フォーカス時にデータを再読み込み
    useFocusEffect(
        React.useCallback(() => {
            loadProfileData();
        }, [dataMode])
    );

    const loadProfileData = async () => {
        if (dataMode === 'mock') {
            // モックモード
            setName(MOCK_SETTINGS.name);
            setDisplayTech('セキュリティ, AI・ML');
            setDisplayHobbies('創作, 音楽');
            setDisplayWorries('お金, 評価・承認');
            setDisplayNotifTime('21:00');
        } else {
            // Liveモード
            try {
                const [
                    userName,
                    userJobTitle,
                    userHobbies,
                    worries,
                    userNotifyTime,
                ] = await AsyncStorage.multiGet([
                    'user_name',
                    'user_job_title',
                    'user_hobbies',
                    'worries',
                    'user_notify_time',
                ]);

                const techArray = userJobTitle[1] ? JSON.parse(userJobTitle[1]) : [];
                const hobbiesArray = userHobbies[1] ? JSON.parse(userHobbies[1]) : [];
                const worriesArray = worries[1] ? JSON.parse(worries[1]) : [];

                setName(userName[1] || '');
                setDisplayTech(techArray.join(', '));
                setDisplayHobbies(hobbiesArray.join(', '));
                setDisplayWorries(worriesArray.join(', '));
                setDisplayNotifTime(userNotifyTime[1] || '21:00');
            } catch (e) {
                console.error('Failed to load profile data:', e);
            }
        }
    };

    const avatarUrl = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix';

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Page Header */}
                    <View style={styles.pageHeader}>
                        <Text style={styles.headerLabel}>PROFILE</Text>
                        <Text style={styles.headerTitle}>プロフィール</Text>
                    </View>

                    {/* Avatar Section */}
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <Image
                                style={styles.avatar}
                                source={{ uri: avatarUrl }}
                                contentFit="cover"
                                transition={1000}
                            />
                        </View>
                    </View>

                    {/* Basic Info Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionHeader}>// 基本情報</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>名前</Text>
                            <Text style={styles.infoValue}>{name || '-'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>好きな技術</Text>
                            <Text style={styles.infoValue}>{displayTech || '-'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>趣味</Text>
                            <Text style={styles.infoValue}>{displayHobbies || '-'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>心配事</Text>
                            <Text style={styles.infoValue}>{displayWorries || '-'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>通知時間</Text>
                            <Text style={styles.infoValue}>{displayNotifTime || '-'}</Text>
                        </View>
                    </View>

                    {/* Edit Buttons */}
                    <View style={styles.sectionContainer}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push('/settings/information')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.editButtonContent}>
                                <Ionicons name="create-outline" size={20} color={Colors.primary} />
                                <Text style={styles.editButtonText}>情報を編集</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={Colors.textDim} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push('/settings/notification')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.editButtonContent}>
                                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                                <Text style={styles.editButtonText}>通知時間を変更</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={Colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    {/* Back to Title Button */}
                    <TouchableOpacity
                        style={styles.backToTitleButton}
                        onPress={() => router.replace('/welcome')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="exit-outline" size={20} color="#ef4444" />
                        <Text style={styles.backToTitleText}>タイトル画面へ戻る</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
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
    sectionContainer: {
        width: '90%',
        marginBottom: 24,
    },
    sectionHeader: {
        color: Colors.primary,
        fontSize: 16,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: 16,
        letterSpacing: 1,
    },
    infoRow: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    infoLabel: {
        color: Colors.secondary,
        fontSize: 11,
        fontFamily: 'monospace',
        marginBottom: 4,
        letterSpacing: 1,
    },
    infoValue: {
        color: Colors.text,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    editButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editButtonText: {
        color: Colors.text,
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    backToTitleButton: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    backToTitleText: {
        color: '#ef4444',
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    pageHeader: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
        width: '100%',
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
