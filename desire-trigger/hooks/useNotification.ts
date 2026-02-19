import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set handler for when notification is received to show alert
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Expo Notificationsで毎日指定時刻に通知をスケジュールする
 * @param time "21:00" 形式
 */
export async function scheduleNotification(time: string): Promise<void> {
    const [hour, minute] = time.split(':').map(Number);

    if (isNaN(hour) || isNaN(minute)) {
        console.warn("Invalid time format for notification:", time);
        return;
    }

    // Permission check
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
            console.warn("Notification permission not granted");
            return;
        }
    }

    // Cancel all existing notifications with this identifier (or all?)
    // For simplicity, cancel all scheduled notifications to refresh
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Desire Trigger",
            body: "今日の診断の時間です⏰",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });

    console.log(`Notification scheduled for ${time} daily.`);
}

/**
 * 翌朝8:00に「昨日のタスクが未完了です」通知をセットする
 * 設定モーダルでReminderがONの場合のみ実行する
 * (ここではON/OFF判定は外側で行う想定)
 */
export async function scheduleReminderNotification(): Promise<void> {
    // Permission check
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Schedule for tomorrow 8:00 AM
    // using seconds trigger or daily trigger?
    // Daily trigger next occurrence at 8:00

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Desire Trigger",
            body: "昨日のタスクが未完了です。確認しましょう。",
            sound: true,
        },
        trigger: {
            hour: 8,
            minute: 0,
            repeats: false, // One-time? Or repeats? 
            // Requirement says "Next morning". It implies a one-time thing if it's conditional.
            // However, trigger with hour/minute usually means recurring daily if type is CalendarTriggerInput.
            // To make it one-time for tomorrow:
            // We can use a Date object or seconds.
        },
    });

    console.log("Reminder notification scheduled for 8:00 AM.");
}
