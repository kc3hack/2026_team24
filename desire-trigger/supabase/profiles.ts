import { supabase } from './client';
import { DBProfile, OnboardingInput } from '../types';

/**
 * 初期セットアップ完了時
 * プロフィールを作成してprofile_idを返す
 */
export async function createUser(data: OnboardingInput): Promise<string> {
    const { data: insertedData, error } = await supabase
        .from('profiles')
        .insert([
            {
                name: data.name,
                job_title: data.job_title,
                hobbies: data.hobbies,
                interests: data.interests,
                current_mode: data.current_mode,
                notify_time: data.notify_time,
            }
        ])
        .select('id')
        .single();

    if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
    }

    return insertedData.id;
}

/**
 * プロフィール情報全体を取得
 */
export async function getUser(profileId: string): Promise<DBProfile> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (error) {
        throw new Error(`Failed to get user: ${error.message}`);
    }

    return data as DBProfile;
}

/**
 * プロフィール更新
 */
export async function updateUser(profileId: string, data: Partial<DBProfile>): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

    if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
}
