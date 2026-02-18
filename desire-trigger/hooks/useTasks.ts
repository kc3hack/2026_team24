import { useState } from 'react';
import { Task } from '../types';

export const useTasks = () => {
    // Initial Mock Data
    const initialTasks: Task[] = [
        {
            id: 'task-1',
            user_id: 'user-1',
            diagnostic_id: 'diag-1',
            title: '技術記事の流し読み',
            description: '最新のトレンドをキャッチアップするために、TechFeedやZennで気になった記事を3つ読む。',
            type: 'quick',
            levelType: 'quick',
            category: '探索系',
            timing_tag: '移動中',
            action_timing: 'auto',
            buff_metric: 'exploration',
            buff_delta: 5,
            buffValue: 5,
            status: 'pending',
            isCompleted: false,
            created_at: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            completed_at: null,
            buff_expires_at: new Date(Date.now() + 86400000).toISOString(),
            task_expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        {
            id: 'task-2',
            user_id: 'user-1',
            diagnostic_id: 'diag-1',
            title: '個人開発のCI/CD構築',
            description: 'GitHub Actionsを使って、デプロイフローを自動化する。ビルド時間の短縮を目指す。',
            type: 'core',
            levelType: 'core',
            category: '実行系',
            timing_tag: '休日',
            action_timing: 'auto',
            buff_metric: 'organization',
            buff_delta: 10,
            buffValue: 10,
            status: 'pending',
            isCompleted: false,
            created_at: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            completed_at: null,
            buff_expires_at: new Date(Date.now() + 86400000).toISOString(),
            task_expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        {
            id: 'task-3',
            user_id: 'user-1',
            diagnostic_id: 'diag-1',
            title: 'デジタルデトックス',
            description: '寝る前の1時間はスマホを触らず、紙の本を読むか瞑想をする。',
            type: 'deep',
            levelType: 'deep',
            category: '休息系',
            timing_tag: '夜',
            action_timing: 'night',
            buff_metric: 'vitality',
            buff_delta: 15,
            buffValue: 15,
            status: 'pending',
            isCompleted: false,
            created_at: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            completed_at: null,
            buff_expires_at: new Date(Date.now() + 86400000).toISOString(),
            task_expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
    ];

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const completeTask = (taskId: string) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId
                ? {
                    ...task,
                    status: 'applied',
                    completed_at: new Date().toISOString(),
                    isCompleted: true
                }
                : task
        ));
    };

    return {
        tasks,
        completeTask,
    };
};
