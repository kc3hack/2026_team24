import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DBTaskSet, Task } from '../types';
import { getActiveTasks, completeTask as completeTaskAPI } from '../supabase/tasks';
import { MOCK_TASK_SETS } from '../constants/mockData';
import { useDataModeStore } from '../store/dataModeStore';

// カテゴリからモードへのマッピング
const categoryToMode: Record<string, string> = {
    '探索系': 'EXPLORATION',
    '没頭系': 'IMMERSION',
    '整理系': 'ORGANIZATION',
    '貢献系': 'CONTRIBUTION',
    '元気系': 'VITALITY',
};

// レベルから時間を推定
const levelToDuration: Record<string, number> = {
    'quick': 5,
    'core': 20,
    'deep': 45,
};

// DBTaskSetをTaskSetに変換
const convertToTaskSet = (dbTaskSet: DBTaskSet): { date: string; tasks: Task[] } => {
    return {
        date: dbTaskSet.date,
        tasks: dbTaskSet.tasks.map(dbTask => {
            const mode = categoryToMode[dbTask.category] || 'EXPLORATION';
            const duration = levelToDuration[dbTask.level] || 30;

            return {
                id: dbTask.id,
                user_id: dbTask.profile_id,
                diagnostic_id: dbTask.diagnostic_id,
                title: dbTask.title,
                description: dbTask.description,
                mode: mode,
                duration: duration,
                difficulty: dbTask.level === 'quick' ? 'QUICK' : dbTask.level === 'core' ? 'CORE' : 'DEEP',
                timing_tag: dbTask.action_timing,
                action_timing: dbTask.action_timing,
                buff_metric: mode.toLowerCase(), // modeからbuff_metricを推測
                buff_delta: 5,
                buffValue: 5,
                buff_expires_at: dbTask.expires_at,
                task_expires_at: dbTask.expires_at,
                expiresAt: dbTask.expires_at,
                deadline: dbTask.expires_at,
                status: dbTask.status,
                completed_at: dbTask.completed_at,
                created_at: dbTask.created_at,
                isCompleted: dbTask.status === 'completed',
            };
        }),
    };
};

export const useTasks = () => {
    const [taskSets, setTaskSets] = useState<{ date: string; tasks: Task[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data Mode Store
    const { dataMode } = useDataModeStore();

    useEffect(() => {
        loadTasks();
    }, [dataMode]); // data_modeが変更されたら再読み込み

    const loadTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('=== useTasks loadTasks START ===');
            console.log('Current data_mode:', dataMode);

            // MOCKモードの場合はモックデータを使用
            if (dataMode === 'mock') {
                console.log('✅ Using MOCK data for tasks');
                console.log('MOCK_TASK_SETS count:', MOCK_TASK_SETS.length);
                setTaskSets(MOCK_TASK_SETS);
                setLoading(false);
                return;
            }

            // LIVEモードの場合はSupabaseから取得
            console.log('✅ Using LIVE data from Supabase');
            const profileId = await AsyncStorage.getItem('profile_id');
            console.log('Profile ID:', profileId);

            if (!profileId) {
                throw new Error('プロフィールが見つかりません');
            }

            console.log('Calling getActiveTasks...');
            const dbTaskSets = await getActiveTasks(profileId);
            console.log('getActiveTasks result:', dbTaskSets.length, 'task sets');

            if (dbTaskSets.length > 0) {
                console.log('Sample task:', dbTaskSets[0].tasks[0]);
            }

            const converted = dbTaskSets.map(convertToTaskSet);
            console.log('Converted task sets:', converted.length);
            setTaskSets(converted);

        } catch (e) {
            console.error('❌ Failed to load tasks:', e);
            setError(e instanceof Error ? e.message : 'タスクの読み込みに失敗しました');
            setTaskSets([]);
        } finally {
            setLoading(false);
            console.log('=== useTasks loadTasks END ===');
        }
    };

    const completeTask = async (taskId: string) => {
        try {
            // LIVEモードの場合のみAPIを呼び出し
            if (dataMode === 'live') {
                await completeTaskAPI(taskId);
            }

            // ローカル状態を更新（MOCK/LIVE共通）
            setTaskSets(prev => prev.map(set => ({
                ...set,
                tasks: set.tasks.map(task =>
                    task.id === taskId
                        ? {
                            ...task,
                            status: 'completed',
                            completed_at: new Date().toISOString(),
                            isCompleted: true
                        }
                        : task
                )
            })));

        } catch (e) {
            console.error('Failed to complete task:', e);
            throw e;
        }
    };

    return {
        taskSets,
        completeTask,
        loading,
        error,
        refreshTasks: loadTasks,
    };
};
