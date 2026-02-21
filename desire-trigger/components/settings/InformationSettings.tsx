import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { SpaceBackground } from '../ui/SpaceBackground';
import SelectionGrid from '../setup/SelectionGrid';
import { updateUser, getUser } from '../../supabase/profiles';
import { useDataModeStore } from '../../store/dataModeStore';

const TECH_OPTIONS = [
    'フロントエンド', 'バックエンド', 'モバイル', 'インフラ・クラウド',
    'AI・ML', 'セキュリティ', 'データ', 'ゲーム開発', 'その他'
];

const HOBBIES_OPTIONS = ['読書', 'ゲーム', '映画', '料理', '旅行', '筋トレ', '音楽', '創作', 'その他'];

const WORRIES_OPTIONS = [
    '人間関係', 'スキル・成長', '締め切り・納期', '将来・キャリア',
    'モチベーション', '睡眠・体調', '評価・承認', 'お金', 'その他'
];

interface InformationSettingsProps {
    onBack: () => void;
}

export function InformationSettings({ onBack }: InformationSettingsProps) {
    const { dataMode } = useDataModeStore();

    const [name, setName] = useState('');
    const [techStack, setTechStack] = useState<string[]>([]);
    const [techOther, setTechOther] = useState('');
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [hobbiesOther, setHobbiesOther] = useState('');
    const [worries, setWorries] = useState<string[]>([]);
    const [worriesOther, setWorriesOther] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [initialValues, setInitialValues] = useState({
        name: '',
        techStack: [] as string[],
        techOther: '',
        hobbies: [] as string[],
        hobbiesOther: '',
        worries: [] as string[],
        worriesOther: '',
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const [
                userName,
                userJobTitle,
                userHobbies,
                userWorries,
            ] = await AsyncStorage.multiGet([
                'user_name',
                'user_job_title',
                'user_hobbies',
                'worries',
            ]);

            // Parse the saved data
            const savedTech = userJobTitle[1] ? JSON.parse(userJobTitle[1]) : [];
            const savedHobbies = userHobbies[1] ? JSON.parse(userHobbies[1]) : [];
            const savedWorries = userWorries[1] ? JSON.parse(userWorries[1]) : [];

            // Check if any saved values are not in the options (meaning they are custom "その他" values)
            const techOtherValue = savedTech.find((t: string) => !TECH_OPTIONS.slice(0, -1).includes(t)) || '';
            const hobbiesOtherValue = savedHobbies.find((h: string) => !HOBBIES_OPTIONS.slice(0, -1).includes(h)) || '';
            const worriesOtherValue = savedWorries.find((w: string) => !WORRIES_OPTIONS.slice(0, -1).includes(w)) || '';

            // Build the selection arrays
            const techSelection = savedTech.map((t: string) =>
                TECH_OPTIONS.slice(0, -1).includes(t) ? t : 'その他'
            );
            const hobbiesSelection = savedHobbies.map((h: string) =>
                HOBBIES_OPTIONS.slice(0, -1).includes(h) ? h : 'その他'
            );
            const worriesSelection = savedWorries.map((w: string) =>
                WORRIES_OPTIONS.slice(0, -1).includes(w) ? w : 'その他'
            );

            const loadedData = {
                name: userName[1] || '',
                techStack: techSelection,
                techOther: techOtherValue,
                hobbies: hobbiesSelection,
                hobbiesOther: hobbiesOtherValue,
                worries: worriesSelection,
                worriesOther: worriesOtherValue,
            };

            setName(loadedData.name);
            setTechStack(loadedData.techStack);
            setTechOther(loadedData.techOther);
            setHobbies(loadedData.hobbies);
            setHobbiesOther(loadedData.hobbiesOther);
            setWorries(loadedData.worries);
            setWorriesOther(loadedData.worriesOther);
            setInitialValues(loadedData);
        } catch (e) {
            console.error('Failed to load profile data:', e);
        }
    };

    const hasChanges = () => {
        return (
            name !== initialValues.name ||
            JSON.stringify(techStack) !== JSON.stringify(initialValues.techStack) ||
            techOther !== initialValues.techOther ||
            JSON.stringify(hobbies) !== JSON.stringify(initialValues.hobbies) ||
            hobbiesOther !== initialValues.hobbiesOther ||
            JSON.stringify(worries) !== JSON.stringify(initialValues.worries) ||
            worriesOther !== initialValues.worriesOther
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

        if (!name.trim()) {
            Alert.alert('エラー', '名前を入力してください');
            return;
        }

        setIsSaving(true);

        try {
            const profileId = await AsyncStorage.getItem('profile_id');
            if (!profileId) {
                throw new Error('プロフィールIDが見つかりません');
            }

            // Process the data like in setup.tsx
            const finalTech = techStack.map(t => t === 'その他' ? techOther : t).filter(Boolean);
            const finalHobbies = hobbies.map(h => h === 'その他' ? hobbiesOther : h).filter(Boolean);
            const finalWorries = worries.map(w => w === 'その他' ? worriesOther : w).filter(Boolean);

            await updateUser(profileId, {
                name: name.trim(),
                job_title: finalTech,
                hobbies: finalHobbies,
                interests: finalTech,
            });

            const updatedProfile = await getUser(profileId);

            await AsyncStorage.multiSet([
                ['user_name', updatedProfile.name],
                ['user_job_title', JSON.stringify(updatedProfile.job_title || [])],
                ['user_hobbies', JSON.stringify(updatedProfile.hobbies || [])],
                ['user_interests', JSON.stringify(updatedProfile.interests || [])],
                ['worries', JSON.stringify(finalWorries)],
            ]);

            // Update initial values to the new state
            const savedTech = updatedProfile.job_title || [];
            const savedHobbies = updatedProfile.hobbies || [];

            const techOtherValue = savedTech.find((t: string) => !TECH_OPTIONS.slice(0, -1).includes(t)) || '';
            const hobbiesOtherValue = savedHobbies.find((h: string) => !HOBBIES_OPTIONS.slice(0, -1).includes(h)) || '';
            const worriesOtherValue = finalWorries.find((w: string) => !WORRIES_OPTIONS.slice(0, -1).includes(w)) || '';

            const techSelection = savedTech.map((t: string) =>
                TECH_OPTIONS.slice(0, -1).includes(t) ? t : 'その他'
            );
            const hobbiesSelection = savedHobbies.map((h: string) =>
                HOBBIES_OPTIONS.slice(0, -1).includes(h) ? h : 'その他'
            );
            const worriesSelection = finalWorries.map((w: string) =>
                WORRIES_OPTIONS.slice(0, -1).includes(w) ? w : 'その他'
            );

            const refreshedData = {
                name: updatedProfile.name,
                techStack: techSelection,
                techOther: techOtherValue,
                hobbies: hobbiesSelection,
                hobbiesOther: hobbiesOtherValue,
                worries: worriesSelection,
                worriesOther: worriesOtherValue,
            };

            setName(refreshedData.name);
            setTechStack(refreshedData.techStack);
            setTechOther(refreshedData.techOther);
            setHobbies(refreshedData.hobbies);
            setHobbiesOther(refreshedData.hobbiesOther);
            setWorries(refreshedData.worries);
            setWorriesOther(refreshedData.worriesOther);
            setInitialValues(refreshedData);

            Alert.alert('成功', 'プロフィールを保存しました', [
                { text: 'OK', onPress: onBack }
            ]);
        } catch (e) {
            console.error('Failed to save profile:', e);
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
                        <Text style={styles.headerLabel}>information</Text>
                        <Text style={styles.headerTitle}>情報設定</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* 名前 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>名前</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Yakiniku Tabetai"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>

                    {/* 好きな技術 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>好きな技術（複数選択可）</Text>
                        <SelectionGrid
                            options={TECH_OPTIONS}
                            selectedItems={techStack}
                            onSelect={setTechStack}
                            otherValue={techOther}
                            onOtherChange={setTechOther}
                        />
                    </View>

                    {/* 趣味 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>趣味（複数選択可）</Text>
                        <SelectionGrid
                            options={HOBBIES_OPTIONS}
                            selectedItems={hobbies}
                            onSelect={setHobbies}
                            otherValue={hobbiesOther}
                            onOtherChange={setHobbiesOther}
                        />
                    </View>

                    {/* 心配事 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>心配事（複数選択可）</Text>
                        <SelectionGrid
                            options={WORRIES_OPTIONS}
                            selectedItems={worries}
                            onSelect={setWorries}
                            otherValue={worriesOther}
                            onOtherChange={setWorriesOther}
                        />
                    </View>
                </ScrollView>

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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: Colors.primary,
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: 12,
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
