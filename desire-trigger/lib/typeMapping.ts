import { MetricKey, PrimaryMetric } from '../types';

export const mapMetricKeyToPrimary = (key: MetricKey): PrimaryMetric => {
    switch (key) {
        case 'organization': return 'refactor';
        case 'vitality': return 'idle';
        case 'exploration': return 'exploration';
        case 'immersion': return 'immersion';
        case 'contribution': return 'contribution';
        // Fallback or explicit mapping for others if needed
        default: return key as PrimaryMetric;
    }
};

export const mapPrimaryToMetricKey = (primary: PrimaryMetric): MetricKey => {
    switch (primary) {
        case 'refactor': return 'organization';
        case 'idle': return 'vitality';
        default: return primary as MetricKey;
    }
};

export const mapMetricsToFrontend = (metrics: Record<string, number>): Record<PrimaryMetric, number> => {
    const mapped: Partial<Record<PrimaryMetric, number>> = {};
    for (const [key, value] of Object.entries(metrics)) {
        if (key === 'organization') mapped.refactor = value;
        else if (key === 'vitality') mapped.idle = value;
        else if (key === 'exploration') mapped.exploration = value;
        else if (key === 'immersion') mapped.immersion = value;
        else if (key === 'contribution') mapped.contribution = value;
    }
    // Fill missing with 0
    const defaults: Record<PrimaryMetric, number> = {
        exploration: 0,
        immersion: 0,
        refactor: 0,
        contribution: 0,
        idle: 0,
        organization: 0,
        vitality: 0
    };
    return { ...defaults, ...mapped } as Record<PrimaryMetric, number>;
};
