import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { useDataModeStore } from '../../store/dataModeStore';
import { SpaceBackground } from '../../components/ui/SpaceBackground';
import { updateUser } from '../../supabase/profiles';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { dataMode } = useDataModeStore();

    const [profileId, setProfileId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [notificationTime, setNotificationTime] = useState(new Date(new Date().setHours(21, 0, 0, 0)));
    const [initialTime, setInitialTime] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [userNotifyTime, profId] = await AsyncStorage.multiGet([
                'user_notify_time',
                'profile_id',
            ]);

            const notifTime = userNotifyTime[1] || '21:00';
            setProfileId(profId[1] || '');
            setInitialTime(notifTime);

            // 通知時間をDateオブジェクトに変換
            const [hours, minutes] = notifTime.split(':').map(Number);
            const timeDate = new Date();
            timeDate.setHours(hours, minutes, 0, 0);
            setNotificationTime(timeDate);
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    };

    const hasChanges = () => {
        const currentTime = `${notificationTime.getHours()}:${notificationTime.getMinutes().toString().padStart(2, '0')}`;
        return currentTime !== initialTime;
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
            const timeStr = `${notificationTime.getHours()}:${notificationTime.getMinutes().toString().padStart(2, '0')}`;

            // Supabaseに保存
            await updateUser(profileId, {
                notify_time: timeStr,
            });

            // AsyncStorageにも保存
            await AsyncStorage.setItem('user_notify_time', timeStr);

            Alert.alert('成功', '通知時間を保存しました', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);
        } catch (e) {
            console.error('Failed to save:', e);
            Alert.alert('エラー', '保存に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>通知時間変更</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="notifications-outline" size={48} color={Colors.primary} />
                    </View>

                    <Text style={styles.description}>
                        毎日この時間に診断をお届けします
                    </Text>

                    {/* Time Display */}
                    <Text style={styles.timeDisplay}>
                        {notificationTime.getHours()}:{notificationTime.getMinutes().toString().padStart(2, '0')}
                    </Text>

                    {/* Platform-specific Time Picker */}
                    {Platform.OS === 'ios' ? (
                        <DateTimePicker
                            value={notificationTime}
                            mode="time"
                            display="spinner"
                            is24Hour={true}
                            onChange={(e, date) => {
                                if (date) setNotificationTime(date);
                            }}
                            textColor='white'
                            style={styles.timePicker}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.androidTimeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons name="time-outline" size={24} color={Colors.primary} />
                                <Text style={styles.androidTimeButtonText}>時間を選択</Text>
                            </TouchableOpacity>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={notificationTime}
                                    mode="time"
                                    display="default"
                                    is24Hour={true}
                                    onChange={(e, date) => {
                                        setShowTimePicker(false);
                                        if (date) setNotificationTime(date);
                                    }}
                                />
                            )}
                        </>
                    )}
                </View>

                {/* Save Button */}
                {dataMode === 'live' && (
                    <View style={styles.footer}>
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

                        {/* Notice */}
                        <View style={styles.noticeContainer}>
                            <Ionicons name="information-circle-outline" size={16} color="#FBBF24" />
                            <Text style={styles.noticeText}>
                                変更をすると、保存された次の日の設定された時間に質問をお届けします。ご注意下さい。
                            </Text>
                        </View>
                    </View>
                )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: Colors.text,
        fontSize: 18,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    iconContainer: {
        marginBottom: 24,
    },
    description: {
        color: Colors.secondary,
        fontSize: 14,
        fontFamily: 'monospace',
        textAlign: 'center',
        marginBottom: 32,
    },
    timeDisplay: {
        color: Colors.text,
        fontSize: 56,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 32,
        textShadowColor: Colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    timePicker: {
        height: 120,
        width: 200,
    },
    androidTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        padding: 16,
    },
    androidTimeButtonText: {
        color: Colors.text,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
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
    noticeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 1,
        borderColor: '#FBBF24',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        gap: 8,
    },
    noticeText: {
        flex: 1,
        color: '#FBBF24',
        fontSize: 12,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
});
