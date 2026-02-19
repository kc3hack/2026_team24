export interface Question {
    id: number;
    text: string;
    category: string;
}

export interface Score {
    recovery: number;
    recognition: number;
    security: number;
    challenge: number;
    stimulation: number;
    connection: number;
    creation: number;
}

export interface Action {
    id: number;
    title: string;
    description: string;
    duration: number;
    category: string;
    why: string;
}

export type PrimaryMetric = 'exploration' | 'immersion' | 'refactor' | 'contribution' | 'idle';

export interface HistoryLog {
    date: string; // ISO format "2026-02-18"
    primaryMetric: PrimaryMetric;
    score: number; // 0-100
    metrics: { [key: string]: number };
    tasksCompleted: number;
    taskList: Task[];
}

export interface Task {
    id: string;
    title: string;
    tag: string;
    time: string;
    color: 'Quick' | 'Core' | 'Deep';
    isCompleted: boolean;
}

export interface Diary {
    id: string;
    date: string;
    content: string;
    mood: string;
}

export interface Profile {
    name: string;
    avatarUrl?: string;
    level: number;
    exp: number;
}
