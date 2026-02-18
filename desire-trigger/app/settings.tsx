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
    const [appIcon, setAppIcon] = useState('DEFAULT');

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
                Alert.alert('システム', 'タイトルへ戻りますか？', [
                    { text: 'いいえ', style: 'cancel' },
                    { text: 'はい', style: 'destructive', onPress: () => router.replace('/') }
                ]);
                break;
        }
    };

    // Helper to get display label from value
    const getOptionLabel = (value: string, options: SettingOption[]) => {
        return options.find(opt => opt.value === value)?.label || value;
    };

    // Helper to sync theme with icon
    const handleIconSelect = (iconId: string) => {
        setAppIcon(iconId);

        // Sync Visual Theme with Icon Choice (Corrected Colors)
        let newTheme = Colors.primary;
        switch (iconId) {
            case 'NEON': newTheme = Colors.cyan; break;
            case 'CRIMSON': newTheme = Colors.danger; break;
            case 'OBSIDIAN': newTheme = Colors.obsidian; break;
            default: newTheme = Colors.primary; break;
        }
        setThemeColor(newTheme);
    };

    const SETTINGS_DATA: SettingSectionType[] = [
        {
            title: "ユーザー変数",
            items: [
                {
                    id: 'job',
                    label: '職種',
                    type: 'select',
                    value: getOptionLabel(job, [
                        { label: '学生', value: 'student' },
                        { label: 'エンジニア (Front)', value: 'frontend' },
                        { label: 'エンジニア (Back)', value: 'backend' },
                        { label: 'エンジニア (Full)', value: 'fullstack' }
                    ]),
                    options: [
                        { label: '学生', value: 'student' },
                        { label: 'エンジニア (Front)', value: 'frontend' },
                        { label: 'エンジニア (Back)', value: 'backend' },
                        { label: 'エンジニア (Full)', value: 'fullstack' }
                    ]
                },
                {
                    id: 'level',
                    label: '経験レベル',
                    type: 'select',
                    value: getOptionLabel(level, [
                        { label: '初級 (Junior)', value: 'junior' },
                        { label: '中級 (Middle)', value: 'middle' },
                        { label: '上級 (Senior)', value: 'senior' },
                        { label: '専門家 (Lead)', value: 'lead' }
                    ]),
                    options: [
                        { label: '初級 (Junior)', value: 'junior' },
                        { label: '中級 (Middle)', value: 'middle' },
                        { label: '上級 (Senior)', value: 'senior' },
                        { label: '専門家 (Lead)', value: 'lead' }
                    ]
                },
            ]
        },
        {
            title: "インターフェース",
            items: [
                { id: 'theme', label: 'テーマカラー', type: 'color_picker' },
                { id: 'icon', label: 'アイコン換装', type: 'icon_selector' },
            ]
        },
        {
            title: "システム",
            items: [
                { id: 'notif', label: '通知', value: notifications, type: 'switch' },
                { id: 'version', label: 'バージョン', value: 'v2.0.0 (Lulu)', type: 'text', disabled: true },
                { id: 'logout', label: 'タイトル画面へ', type: 'button', danger: true, action: 'logout' },
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
                                        }
                                    }}
                                    // Props for specific types
                                    selectedColor={themeColor}
                                    onColorSelect={(color) => setThemeColor(color)}
                                    currentIcon={appIcon}
                                    onIconSelect={handleIconSelect}
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
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
});
