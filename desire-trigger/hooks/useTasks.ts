import { useState } from 'react';
import { Task } from '../types';
import { MOCK_TASKS } from '../store/mockStore';

export const useTasks = () => {
    // Use Shared Mock Data
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

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
