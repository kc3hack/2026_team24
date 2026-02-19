import { PrimaryMetric } from '../types';

export const METRIC_COLORS: Record<PrimaryMetric, string> = {
    exploration: '#3B82F6',
    immersion: '#10B981',
    organization: '#8B5CF6',
    contribution: '#F97316',
    vitality: '#06B6D4',
    refactor: '#8B5CF6',
    idle: '#06B6D4',
};

export const METRIC_LABELS: Record<PrimaryMetric, string> = {
    exploration: '探索',
    immersion: '没頭',
    organization: '整理',
    contribution: '貢献',
    vitality: '元気',
    refactor: '整理',
    idle: '元気',
};
