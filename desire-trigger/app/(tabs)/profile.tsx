import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { MOCK_SETTINGS } from '../../constants/mockData';
import { useDataModeStore } from '../../store/dataModeStore';
import { SpaceBackground } from '../../components/ui/SpaceBackground';
import { updateUser } from '../../supabase/profiles';

export default function ProfileScreen() {
    const router = useRouter();
    const { dataMode } = useDataModeStore();

    // フォームの状態管理
    const [name, setName] = useState('');
    const [favoriteTech, setFavoriteTech] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [worries, setWorries] = useState('');
    const [notificationTime, setNotificationTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 初期値を保存（変更検知用）
    const [initialValues, setInitialValues] = useState({
        name: '',
        favoriteTech: '',
        hobbies: '',
        worries: '',
        notificationTime: '',
    });

    // データ読み込み
    useEffect(() => {
        loadProfileData();
    }, [dataMode]);

    const loadProfileData = async () => {
        if (dataMode === 'mock') {
            // モックモードの場合
            const mockData = {
                name: MOCK_SETTINGS.name,
                favoriteTech: MOCK_SETTINGS.favoriteTech,
                hobbies: MOCK_SETTINGS.hobbies,
                worries: MOCK_SETTINGS.worries,
                notificationTime: MOCK_SETTINGS.notificationTime,
            };
            setName(mockData.name);
            setFavoriteTech(mockData.favoriteTech);
            setHobbies(mockData.hobbies);
            setWorries(mockData.worries);
            setNotificationTime(mockData.notificationTime);
            setInitialValues(mockData);
        } else {
            // Liveモード: AsyncStorageから実データを読み込み
            try {
                const [
                    userName,
                    userJobTitle,
                    userHobbies,
                    userInterests,
                    userNotifyTime,
                    worries,
                ] = await AsyncStorage.multiGet([
                    'user_name',
                    'user_job_title',
                    'user_hobbies',
                    'user_interests',
                    'user_notify_time',
                    'worries',
                ]);

                const loadedData = {
                    name: userName[1] || '',
                    favoriteTech: userJobTitle[1] ? JSON.parse(userJobTitle[1]).join(', ') : (userInterests[1] ? JSON.parse(userInterests[1]).join(', ') : ''),
                    hobbies: userHobbies[1] ? JSON.parse(userHobbies[1]).join(', ') : '',
                    worries: worries[1] ? JSON.parse(worries[1]).join(', ') : '',
                    notificationTime: userNotifyTime[1] || '',
                };

                setName(loadedData.name);
                setFavoriteTech(loadedData.favoriteTech);
                setHobbies(loadedData.hobbies);
                setWorries(loadedData.worries);
                setNotificationTime(loadedData.notificationTime);
                setInitialValues(loadedData);
            } catch (e) {
                console.error('Failed to load profile data:', e);
            }
        }
    };

    const hasChanges = () => {
        return (
            name !== initialValues.name ||
            favoriteTech !== initialValues.favoriteTech ||
            hobbies !== initialValues.hobbies ||
            worries !== initialValues.worries ||
            notificationTime !== initialValues.notificationTime
        );
    };

    const handleSave = async () => {
        if (dataMode === 'mock') {
            Alert.alert('Mock Mode', 'Mock modeでは保存できません');
            return;
        }

        if (!hasChanges()) {
            Alert.alert('変更なし', '変更された項目がありません');
            return;
        }

        setIsSaving(true);

        try {
            // 1. profile_idを取得
            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) {
                throw new Error('プロフィールIDが見つかりません');
            }

            // 2. データを整形（カンマ区切りから配列へ）
            const hobbiesArray = hobbies.split(',').map(h => h.trim()).filter(Boolean);
            const techArray = favoriteTech.split(',').map(t => t.trim()).filter(Boolean);
            const worriesArray = worries.split(',').map(w => w.trim()).filter(Boolean);

            // 3. Supabaseに保存
            await updateUser(profileId, {
                name: name,
                job_title: techArray,
                hobbies: hobbiesArray,
                interests: techArray,
                notify_time: notificationTime,
            });

            // 4. AsyncStorageにも保存
            await AsyncStorage.multiSet([
                ['user_name', name],
                ['user_job_title', JSON.stringify(techArray)],
                ['user_hobbies', JSON.stringify(hobbiesArray)],
                ['user_interests', JSON.stringify(techArray)],
                ['user_notify_time', notificationTime],
                ['worries', JSON.stringify(worriesArray)],
            ]);

            // 初期値を更新
            setInitialValues({
                name: name,
                favoriteTech: favoriteTech,
                hobbies: hobbies,
                worries: worries,
                notificationTime: notificationTime,
            });

            Alert.alert('成功', 'プロフィールを保存しました');
        } catch (e) {
            console.error('Failed to save profile:', e);
            Alert.alert('エラー', '保存に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsSaving(false);
        }
    };

    const avatarUrl = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix';

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

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

                {/* Profile Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>// プロフィール</Text>

                    {/* 名前（1フィールド） */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>名前</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Yakiniku Tabetai"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>

                    {/* 好きな技術 */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>好きな技術</Text>
                        <TextInput
                            style={styles.input}
                            value={favoriteTech}
                            onChangeText={setFavoriteTech}
                            placeholder="セキュリティ, AI・ML"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>

                    {/* 趣味 */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>趣味</Text>
                        <TextInput
                            style={styles.input}
                            value={hobbies}
                            onChangeText={setHobbies}
                            placeholder="創作, 音楽"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>

                    {/* 心配事 */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>心配事</Text>
                        <TextInput
                            style={styles.input}
                            value={worries}
                            onChangeText={setWorries}
                            placeholder="お金, 評価・承認"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>

                    {/* 通知時間 */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>通知時間</Text>
                        <TextInput
                            style={styles.input}
                            value={notificationTime}
                            onChangeText={setNotificationTime}
                            placeholder="21:00"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>
                </View>

                {/* 保存ボタン */}
                {dataMode === 'live' && (
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (!hasChanges() || isSaving) && styles.saveButtonDisabled
                        ]}
                        onPress={handleSave}
                        disabled={!hasChanges() || isSaving}
                        activeOpacity={0.7}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>保存</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* タイトル画面へ戻るボタン */}
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
        backgroundColor: '#050510', // 宇宙背景に合わせた背景色
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
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        color: Colors.secondary,
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 6,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        color: Colors.text,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    saveButton: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(100, 100, 100, 0.3)',
        shadowOpacity: 0,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 8,
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
});
