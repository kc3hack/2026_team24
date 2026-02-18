
import { supabase } from './client';
import { Profile, OnboardingInput } from '../types';

/**
 * 初期セットアップ完了時（ホームへ進むボタンを押したとき）
 * 一度だけ呼ぶ。返ってきたprofile_idをAsyncStorageに保存する。
 */
export async function saveProfile(data: OnboardingInput): Promise<string> {
    const { data: insertedData, error } = await supabase
        .from('profiles')
        .insert([
            {
                name: data.name,
                job_title: data.job_title,
                job_title_other: data.job_title_other,
                hobbies: data.hobbies,
                interests: data.interests,
                current_mode: data.current_mode,
                notify_time: data.notify_time,
                // created_at, updated_at are handled by default
            }
        ])
        .select('id')
        .single();

    if (error) {
        throw new Error(`Failed to save profile: ${error.message}`);
    }

    return insertedData.id;
}

/**
 * プロフィール情報全体を取得
 * - ホーム画面起動時
 * - 設定モーダル起動時
 * - Edge Function呼び出し時
 */
export async function getProfile(profileId: string): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (error) {
        throw new Error(`Failed to get profile: ${error.message}`);
    }

    return data as Profile;
}

/**
 * 設定画面から更新（job_title / notify_time など）
 */
export async function updateProfile(profileId: string, data: Partial<Profile>): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

    if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }
}
