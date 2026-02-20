import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';

export const useSettings = () => {
    const router = useRouter();
    const settingsStore = useSettingsStore();

    // Map store to consistent object for easier consumption in UI if needed, 
    // or just expose the store values directly. 
    // For compatibility with existing UI:
    const settings = {
        name: settingsStore.name,
        favorite_technology: settingsStore.favorite_technology,
        hobbies: settingsStore.hobbies,
        worry: settingsStore.worry,
        notify_time: settingsStore.notify_time,
    };

    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [pendingTime, setPendingTime] = useState<string | null>(null);

    const updateSetting = (key: string, value: string) => {
        switch (key) {
            case 'name': settingsStore.setName(value); break;
            case 'favorite_technology': settingsStore.setFavoriteTechnology(value); break;
            case 'hobbies': settingsStore.setHobbies(value); break;
            case 'worry': settingsStore.setWorry(value); break;
            case 'notify_time': settingsStore.setNotifyTime(value); break;
        }
    };

    const handleTimeChangeRequest = (newTime: string) => {
        setPendingTime(newTime);
        setIsWarningModalVisible(true);
    };

    const confirmTimeChange = () => {
        if (pendingTime) {
            settingsStore.setNotifyTime(pendingTime);
            setPendingTime(null);
            setIsWarningModalVisible(false);
        }
    };

    const cancelTimeChange = () => {
        setPendingTime(null);
        setIsWarningModalVisible(false);
    };

    const handleBackToTitle = () => {
        Alert.alert('SYSTEM', 'タイトルへ戻りますか？', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'destructive', onPress: () => router.replace('/') }
        ]);
    };

    return {
        settings,
        updateSetting,
        handleTimeChangeRequest,
        isWarningModalVisible,
        confirmTimeChange,
        cancelTimeChange,
        handleBackToTitle,
        pendingTime,
    };
};
