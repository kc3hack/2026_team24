import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { SpaceBackground } from '../ui/SpaceBackground';
import { updateUser, getUser } from '../../supabase/profiles';
import { useDataModeStore } from '../../store/dataModeStore';

interface NotificationSettingsProps {
    onBack: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
    const { dataMode } = useDataModeStore();

    const [time, setTime] = useState(new Date());
    const [initialTime, setInitialTime] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

    useEffect(() => {
        loadNotificationTime();
    }, []);

    const loadNotificationTime = async () => {
        try {
            const [notifyTime] = await AsyncStorage.multiGet(['user_notify_time']);
            const timeStr = notifyTime[1] || '21:00';
            const [hours, minutes] = timeStr.split(':').map(Number);

            const date = new Date();
            date.setHours(hours, minutes, 0, 0);

            setTime(date);
            setInitialTime(date);
        } catch (e) {
            console.error('Failed to load notification time:', e);
        }
    };

    const hasChanges = () => {
        return time.getTime() !== initialTime.getTime();
    };

    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            setTime(selectedDate);
        }
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
            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) {
                throw new Error('プロフィールIDが見つかりません');
            }

            const timeStr = formatTime(time);

            await updateUser(profileId, {
                notify_time: timeStr,
            });

            const updatedProfile = await getUser(profileId);

            await AsyncStorage.setItem('user_notify_time', updatedProfile.notify_time);

            const [hours, minutes] = updatedProfile.notify_time.split(':').map(Number);
            const updatedDate = new Date();
            updatedDate.setHours(hours, minutes, 0, 0);

            setTime(updatedDate);
            setInitialTime(updatedDate);

            Alert.alert('成功', '通知時間を保存しました', [
                { text: 'OK', onPress: onBack }
            ]);
        } catch (e) {
            console.error('Failed to save notification time:', e);
            Alert.alert('エラー', '保存に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <SpaceBackground />
            <SafeAreaView style={styles.safeArea}>
                {/* ヘッダー */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerLabel}>notification</Text>
                        <Text style={styles.headerTitle}>通知時間設定</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* 現在の設定時刻 */}
                    <View style={styles.currentTimeCard}>
                        <Text style={styles.currentTimeLabel}>現在の設定時刻</Text>
                        <Text style={styles.currentTimeValue}>{formatTime(time)}</Text>
                    </View>

                    {/* DateTimePicker */}
                    <View style={styles.pickerSection}>
                        <Text style={styles.sectionTitle}>時刻ピッカー</Text>

                        {Platform.OS === 'android' && (
                            <TouchableOpacity
                                style={styles.androidPickerButton}
                                onPress={() => setShowPicker(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                                <Text style={styles.androidPickerButtonText}>
                                    時刻を選択: {formatTime(time)}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {showPicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleTimeChange}
                                style={styles.picker}
                            />
                        )}
                    </View>

                    {/* 警告メッセージ */}
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning-outline" size={20} color="#f59e0b" />
                        <Text style={styles.warningText}>
                            変更は翌日の設定時刻から反映されます
                        </Text>
                    </View>
                </View>

                {/* 保存ボタン */}
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
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
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
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    currentTimeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
    },
    currentTimeLabel: {
        color: Colors.textDim,
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    currentTimeValue: {
        color: Colors.primary,
        fontSize: 48,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    pickerSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: Colors.primary,
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: 16,
        letterSpacing: 1,
    },
    androidPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 16,
        gap: 12,
    },
    androidPickerButtonText: {
        color: Colors.text,
        fontSize: 14,
        fontFamily: 'monospace',
    },
    picker: {
        width: '100%',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    warningText: {
        color: '#f59e0b',
        fontSize: 13,
        fontFamily: 'monospace',
        flex: 1,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        backgroundColor: 'rgba(5, 5, 16, 0.95)',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(100, 100, 100, 0.3)',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
});
