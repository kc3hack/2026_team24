import { Diagnostic } from '../types';

/**
 * プロフィール画面のストリーク表示
 * 今日から遡って連続して診断している日数を返す
 */
export function calcStreak(diagnostics: Diagnostic[]): number {
    if (!diagnostics || diagnostics.length === 0) return 0;

    // Clone and sort descending by date just in case
    const sorted = [...diagnostics].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if latest diagnostic is today or yesterday
    const latestDiag = sorted[0];
    const latestDate = new Date(latestDiag.date);
    latestDate.setHours(0, 0, 0, 0);

    // If latest is today, start counting from today backwards
    // If latest is yesterday, start counting from yesterday backwards
    // If latest is before yesterday, streak is broken (0) unless we consider current streak for display purposes...
    // Usually streak is "current active streak".

    // Logic: 
    // 1. Determine "current check date". Start with today.
    // 2. If no diag for today, check usage logic:
    //    - If user hasn't done it today yet, streak should rely on yesterday.
    //    - If user missed yesterday, streak is 0.

    // Simplified logic from FUNCTIONS.md: "今日から1日ずつ遡って診断があれば+1"

    let checkDate = new Date(today);

    // Check if we have a diagnostic for today
    const hasToday = sorted.some(d => isSameDate(new Date(d.date), today));

    if (!hasToday) {
        // If not today, check if we have yesterday to continue streak
        const hasYesterday = sorted.some(d => isSameDate(new Date(d.date), yesterday));
        if (!hasYesterday) {
            return 0;
        }
        // Start checking from yesterday
        checkDate = new Date(yesterday);
    }

    // Count backwards
    while (true) {
        const found = sorted.some(d => isSameDate(new Date(d.date), checkDate));
        if (found) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

function isSameDate(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}
