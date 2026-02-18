import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SettingSection } from '../components/settings/SettingSection';
import { SettingItem } from '../components/settings/SettingItem';
import { SelectionModal, SettingOption } from '../components/settings/SelectionModal';

// Define the shape of a setting item
type SettingItemType = {
    id: string;
    label: string;
    value?: string | boolean;
    type: 'switch' | 'text' | 'button' | 'color_picker' | 'icon_selector' | 'input' | 'select' | 'time';
    danger?: boolean;
    disabled?: boolean;
    description?: string;
    options?: SettingOption[];
    action?: string;
};

type SettingSectionType = {
    title: string;
    items: SettingItemType[];
};

export default function SettingsScreen() {
    const router = useRouter();

    // State management
    const [themeColor, setThemeColor] = useState(Colors.primary);

    // User Variables
    const [job, setJob] = useState('frontend');
    const [level, setLevel] = useState('junior');

    // System
    const [notifications, setNotifications] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentModalOptions, setCurrentModalOptions] = useState<SettingOption[]>([]);
    const [currentModalTitle, setCurrentModalTitle] = useState('');
    const [currentModalKey, setCurrentModalKey] = useState('');

    const openModal = (key: string, title: string, options: SettingOption[]) => {
        setCurrentModalKey(key);
        setCurrentModalTitle(title);
        setCurrentModalOptions(options);
        setModalVisible(true);
    };

    const handleSelect = (value: string) => {
        if (currentModalKey === 'job') setJob(value);
        if (currentModalKey === 'level') setLevel(value);
    };

    const handleAction = (action: string) => {
        switch (action) {
            case 'logout':
                Alert.alert('SYSTEM', 'タイトルへ戻りますか？', [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', style: 'destructive', onPress: () => router.replace('/') }
                ]);
                break;
            case 'cache':
                Alert.alert('SYSTEM', 'メモリ解放を実行しました。\n> CACHE_CLEARED');
                break;
        }
    };

    // Helper to get display label from value
    const getOptionLabel = (value: string, options: SettingOption[]) => {
        return options.find(opt => opt.value === value)?.label || value;
    };


    const SETTINGS_DATA: SettingSectionType[] = [
        {
            title: "ユーザー変数",
            items: [
                {
                    id: 'job',
                    label: '現在のジョブ',
                    type: 'select',
                    value: getOptionLabel(job, [
                        { label: '情報学部生', value: 'student' },
                        { label: 'フロントエンド', value: 'frontend' },
                        { label: 'バックエンド', value: 'backend' },
                        { label: 'フルスタック', value: 'fullstack' }
                    ]),
                    options: [
                        { label: '情報学部生', value: 'student' },
                        { label: 'フロントエンド', value: 'frontend' },
                        { label: 'バックエンド', value: 'backend' },
                        { label: 'フルスタック', value: 'fullstack' }
                    ]
                },
                {
                    id: 'level',
                    label: '経験値 (Level)',
                    type: 'select',
                    value: getOptionLabel(level, [
                        { label: '初級', value: 'junior' },
                        { label: '中級', value: 'middle' },
                        { label: '上級', value: 'senior' },
                        { label: '専門家', value: 'lead' }
                    ]),
                    options: [
                        { label: '初級', value: 'junior' },
                        { label: '中級', value: 'middle' },
                        { label: '上級', value: 'senior' },
                        { label: '専門家', value: 'lead' }
                    ]
                },
            ]
        },
        {
            title: "視覚同期",
            items: [
                { id: 'theme', label: 'テーマカラー', type: 'color_picker' },
            ]
        },
        {
            title: "システム",
            items: [
                { id: 'notif', label: '通知デリバリー', value: notifications, type: 'switch' },
                { id: 'version', label: 'バージョン', value: 'v1.0.0', type: 'text', disabled: true },
                { id: 'logout', label: 'タイトルへ戻る', type: 'button', danger: true, action: 'logout' },
            ]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: themeColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColor} />
                    <Text style={[styles.headerTitle, { color: themeColor }]}>設定を閉じる</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {SETTINGS_DATA.map((section, index) => (
                    <View key={index} style={styles.sectionWrapper}>
                        <SettingSection title={section.title} color={themeColor} />
                        <View style={[styles.itemsWrapper, { borderColor: themeColor }]}>
                            {section.items.map((item) => (
                                <SettingItem
                                    key={item.id}
                                    label={item.label}
                                    value={item.value}
                                    type={item.type}
                                    danger={item.danger}
                                    disabled={item.disabled}
                                    description={item.description}
                                    onPress={() => {
                                        if (item.type === 'select' && item.options) {
                                            openModal(item.id, item.label, item.options);
                                        } else if (item.type === 'switch') {
                                            if (item.id === 'notif') setNotifications(!notifications);
                                        } else if (item.action) {
                                            handleAction(item.action);
                                        } else if (item.id === 'cache' && item.type === 'button') {
                                            handleAction('cache');
                                        }
                                    }}
                                    // Props for specific types
                                    selectedColor={themeColor}
                                    onColorSelect={(color) => setThemeColor(color)}
                                />
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <SelectionModal
                visible={modalVisible}
                title={currentModalTitle}
                options={currentModalOptions}
                currentValue={currentModalKey === 'job' ? job : level}
                onSelect={handleSelect}
                onClose={() => setModalVisible(false)}
                themeColor={themeColor}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    sectionWrapper: {
        marginBottom: 24,
    },
    itemsWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)', // Very subtle background for items group
        borderRadius: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
});
