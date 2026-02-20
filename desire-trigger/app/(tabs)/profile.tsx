import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

import { useSettingsStore } from '../../store/settingsStore';
import { useSettings } from '../../hooks/useSettings';
import { SettingSection } from '../../components/settings/SettingSection';
import { SettingItem } from '../../components/settings/SettingItem';
import NotificationWarningModal from '../../components/settings/NotificationWarningModal';
import { SelectionModal } from '../../components/settings/SelectionModal';
import { SpaceBackground } from '../../components/ui/SpaceBackground';

const { width, height } = Dimensions.get('window');

// Interactive Card Component for "Float" effect
const InteractiveCard = ({ children, style }: { children: React.ReactNode, style?: any }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1.02,
            useNativeDriver: true,
            friction: 5,
            tension: 200,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 200,
        }).start();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ width: '100%' }}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const settingsStore = useSettingsStore();

    const {
        settings,
        updateSetting,
        handleTimeChangeRequest,
        isWarningModalVisible,
        confirmTimeChange,
        cancelTimeChange,
        handleBackToTitle,
        pendingTime
    } = useSettings();

    const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

    // Animation Values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1.1,
            useNativeDriver: true,
            friction: 5,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
        }).start();
    };

    const timeOptions = Array.from({ length: 24 }, (_, i) => {
        const h = String(i).padStart(2, '0');
        const t = `${h}:00`;
        return { label: t, value: t };
    });

    const themeColor = Colors.primary;

    const MOCK_USER = {
        name: settingsStore.name,
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    };

    // Parallax Interpolations
    const bgTranslateY = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [0, 150], // Moves slower (downwards) than content
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            {/* Parallax Background Layer */}
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: bgTranslateY }] }]}>
                <SpaceBackground />

                {/* Center Faint Light */}
                <View style={styles.centerLight} />

                {/* Bottom Semi-circle Gradient (Simulated) */}
                <View style={styles.bottomGradient} />
            </Animated.View>

            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                >

                    {/* Header Section (Action Style - No Glow) */}
                    <View style={styles.header}>
                        <Text style={styles.headerLabel}>profile</Text>
                        <Text style={styles.headerTitle}>設定</Text>
                    </View>

                    {/* Avatar Section */}
                    <View style={styles.profileSection}>
                        <Pressable
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            style={styles.avatarWrapper}
                        >
                            <Animated.View style={[
                                styles.avatarContainer,
                                { transform: [{ scale: scaleAnim }] }
                            ]}>
                                <Image
                                    style={styles.avatar}
                                    source={{ uri: MOCK_USER.avatar }}
                                    contentFit="cover"
                                    transition={1000}
                                />
                                <View style={styles.statusBadgeWrapper}>
                                    <View style={styles.statusBadgeGlow} />
                                    <View style={styles.statusBadge} />
                                </View>
                            </Animated.View>
                        </Pressable>
                    </View>

                    {/* Settings Form Section */}
                    <View style={styles.formContainer}>

                        {/* Profile Settings */}
                        <View style={styles.sectionWrapper}>
                            <SettingSection title="プロフィール" color={themeColor} />
                            <InteractiveCard style={[styles.itemsWrapper, { borderColor: themeColor, shadowColor: themeColor }]}>
                                <SettingItem
                                    label="名前"
                                    type="input"
                                    value={settings.name}
                                    onChangeText={(text) => updateSetting('name', text)}
                                />
                                <SettingItem
                                    label="好きな技術"
                                    type="input"
                                    value={settings.favorite_technology}
                                    onChangeText={(text) => updateSetting('favorite_technology', text)}
                                />
                                <SettingItem
                                    label="趣味"
                                    type="input"
                                    value={settings.hobbies}
                                    onChangeText={(text) => updateSetting('hobbies', text)}
                                />
                                <SettingItem
                                    label="心配事"
                                    type="input"
                                    value={settings.worry}
                                    onChangeText={(text) => updateSetting('worry', text)}
                                />
                            </InteractiveCard>
                        </View>

                        {/* System Settings */}
                        <View style={styles.sectionWrapper}>
                            <SettingSection title="システム" color={themeColor} />
                            <InteractiveCard style={[styles.itemsWrapper, { borderColor: themeColor, shadowColor: themeColor }]}>
                                <SettingItem
                                    label="通知時間設定"
                                    type="time"
                                    value={settings.notify_time}
                                    onPress={() => setIsTimeModalVisible(true)}
                                />
                                <SettingItem
                                    label="タイトルへ戻る"
                                    type="button"
                                    danger
                                    onPress={handleBackToTitle}
                                />
                            </InteractiveCard>
                        </View>

                    </View>

                </Animated.ScrollView>

                {/* Modals */}
                <NotificationWarningModal
                    visible={isWarningModalVisible}
                    pendingTime={pendingTime}
                    onConfirm={confirmTimeChange}
                    onCancel={cancelTimeChange}
                />

                <SelectionModal
                    visible={isTimeModalVisible}
                    title="通知時間設定"
                    options={timeOptions}
                    currentValue={settings.notify_time}
                    onSelect={(val) => {
                        setIsTimeModalVisible(false);
                        if (val !== settings.notify_time) {
                            handleTimeChangeRequest(val);
                        }
                    }}
                    onClose={() => setIsTimeModalVisible(false)}
                    themeColor={themeColor}
                />
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
    // Background Elements
    centerLight: {
        position: 'absolute',
        top: height * 0.3,
        left: width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: Colors.primary,
        opacity: 0.05,
        transform: [{ scale: 1.5 }],
    },
    bottomGradient: {
        position: 'absolute',
        bottom: -width * 0.5,
        left: -width * 0.25,
        width: width * 1.5,
        height: width,
        borderRadius: width,
        backgroundColor: 'rgba(26, 11, 46, 0.4)', // Purple-ish gradient base
        shadowColor: '#1A0B2E',
        shadowRadius: 50,
        shadowOpacity: 0.5,
    },
    header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'flex-start',
    },
    headerLabel: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 2,
        fontWeight: 'bold',
        marginBottom: 4,
        // No Glow
    },
    headerTitle: {
        fontSize: 36, // Larger
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 30, // More space
    },
    avatarWrapper: {
        // Just a hit slop wrapper
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
        padding: 4,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 70, // Matches enlarged size
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        backgroundColor: 'rgba(88, 166, 255, 0.1)',
    },
    avatar: {
        width: 120, // Enlarged from 100
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.secondary,
    },
    statusBadgeWrapper: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadgeGlow: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.accent,
        opacity: 0.6,
        transform: [{ scale: 1.5 }],
    },
    statusBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.accent,
        borderWidth: 2,
        borderColor: '#050510',
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: 16,
    },
    sectionWrapper: {
        marginBottom: 32, // More space between sections
    },
    itemsWrapper: {
        backgroundColor: 'rgba(5, 5, 16, 0.6)', // Darker background
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        // Neon Glow properties
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, // Stronger
        shadowRadius: 20, // Wider vague light
        elevation: 10, // Stronger elevation
    },
});
