import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { useDataModeStore } from '../../store/dataModeStore';
import { SpaceBackground } from '../../components/ui/SpaceBackground';
import { updateUser } from '../../supabase/profiles';
import SelectionGrid from '../../components/setup/SelectionGrid';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TECH_STACK_OPTIONS = [
    'フロントエンド', 'バックエンド', 'モバイル', 'インフラ・クラウド',
    'AI・ML', 'セキュリティ', 'データ', 'ゲーム開発',
    'その他'
];

const HOBBIES_OPTIONS = ['読書', 'ゲーム', '映画', '料理', '旅行', '筋トレ', '音楽', '創作', 'その他'];

const WORRIES_OPTIONS = [
    '人間関係', 'スキル・成長', '締め切り・納期', '将来・キャリア',
    'モチベーション', '睡眠・体調', '評価・承認', 'お金',
    'その他'
];

export default function InformationSettingsScreen() {
    const router = useRouter();
    const { dataMode } = useDataModeStore();

    const [profileId, setProfileId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [selectedTech, setSelectedTech] = useState<string[]>([]);
    const [techOther, setTechOther] = useState('');
    const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
    const [hobbiesOther, setHobbiesOther] = useState('');
    const [selectedWorries, setSelectedWorries] = useState<string[]>([]);
    const [worriesOther, setWorriesOther] = useState('');

    // Initial values for change detection
    const [initialValues, setInitialValues] = useState({
        name: '',
        tech: [] as string[],
        techOther: '',
        hobbies: [] as string[],
        hobbiesOther: '',
        worries: [] as string[],
        worriesOther: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [
                userName,
                userJobTitle,
                userHobbies,
                worries,
                profId,
            ] = await AsyncStorage.multiGet([
                'user_name',
                'user_job_title',
                'user_hobbies',
                'worries',
                'profile_id',
            ]);

            const techArray = userJobTitle[1] ? JSON.parse(userJobTitle[1]) : [];
            const hobbiesArray = userHobbies[1] ? JSON.parse(userHobbies[1]) : [];
            const worriesArray = worries[1] ? JSON.parse(worries[1]) : [];

            setName(userName[1] || '');
            setProfileId(profId[1] || '');

            // 「その他」の処理
            const techForSelection = techArray.map((t: string) =>
                TECH_STACK_OPTIONS.includes(t) ? t : 'その他'
            );
            const techOtherValue = techArray.find((t: string) => !TECH_STACK_OPTIONS.includes(t)) || '';

            const hobbiesForSelection = hobbiesArray.map((h: string) =>
                HOBBIES_OPTIONS.includes(h) ? h : 'その他'
            );
            const hobbiesOtherValue = hobbiesArray.find((h: string) => !HOBBIES_OPTIONS.includes(h)) || '';

            const worriesForSelection = worriesArray.map((w: string) =>
                WORRIES_OPTIONS.includes(w) ? w : 'その他'
            );
            const worriesOtherValue = worriesArray.find((w: string) => !WORRIES_OPTIONS.includes(w)) || '';

            setSelectedTech(techForSelection);
            setTechOther(techOtherValue);
            setSelectedHobbies(hobbiesForSelection);
            setHobbiesOther(hobbiesOtherValue);
            setSelectedWorries(worriesForSelection);
            setWorriesOther(worriesOtherValue);

            setInitialValues({
                name: userName[1] || '',
                tech: techForSelection,
                techOther: techOtherValue,
                hobbies: hobbiesForSelection,
                hobbiesOther: hobbiesOtherValue,
                worries: worriesForSelection,
                worriesOther: worriesOtherValue,
            });
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    };

    const hasChanges = () => {
        return (
            name !== initialValues.name ||
            JSON.stringify(selectedTech) !== JSON.stringify(initialValues.tech) ||
            techOther !== initialValues.techOther ||
            JSON.stringify(selectedHobbies) !== JSON.stringify(initialValues.hobbies) ||
            hobbiesOther !== initialValues.hobbiesOther ||
            JSON.stringify(selectedWorries) !== JSON.stringify(initialValues.worries) ||
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

        setIsSaving(true);

        try {
            // データを整形
            const finalTech = selectedTech.map(t => t === 'その他' ? techOther : t).filter(Boolean);
            const finalHobbies = selectedHobbies.map(h => h === 'その他' ? hobbiesOther : h).filter(Boolean);
            const finalWorries = selectedWorries.map(w => w === 'その他' ? worriesOther : w).filter(Boolean);

            // Supabaseに保存
            await updateUser(profileId, {
                name: name,
                job_title: finalTech,
                hobbies: finalHobbies,
                interests: finalTech,
            });

            // AsyncStorageにも保存
            await AsyncStorage.multiSet([
                ['user_name', name],
                ['user_job_title', JSON.stringify(finalTech)],
                ['user_hobbies', JSON.stringify(finalHobbies)],
                ['user_interests', JSON.stringify(finalTech)],
                ['worries', JSON.stringify(finalWorries)],
            ]);

            Alert.alert('成功', '情報を保存しました', [
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
                    <Text style={styles.headerTitle}>情報編集</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* 名前 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>名前</Text>
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Display Name"
                            placeholderTextColor={Colors.textDim}
                        />
                    </View>

                    {/* 好きな技術 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>好きな技術</Text>
                        <SelectionGrid
                            options={TECH_STACK_OPTIONS}
                            selectedItems={selectedTech}
                            onSelect={setSelectedTech}
                            otherValue={techOther}
                            onOtherChange={setTechOther}
                        />
                    </View>

                    {/* 趣味 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>趣味</Text>
                        <SelectionGrid
                            options={HOBBIES_OPTIONS}
                            selectedItems={selectedHobbies}
                            onSelect={setSelectedHobbies}
                            otherValue={hobbiesOther}
                            onOtherChange={setHobbiesOther}
                        />
                    </View>

                    {/* 心配事 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>心配事</Text>
                        <SelectionGrid
                            options={WORRIES_OPTIONS}
                            selectedItems={selectedWorries}
                            onSelect={setSelectedWorries}
                            otherValue={worriesOther}
                            onOtherChange={setWorriesOther}
                        />
                    </View>
                </ScrollView>

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
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        color: Colors.primary,
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
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
    nameInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        color: Colors.text,
        fontSize: 16,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
});
