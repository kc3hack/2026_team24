import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SettingsState = {
    name: string;
    favorite_technology: string;
    hobbies: string;
    worry: string;
    notify_time: string;

    // Actions
    setName: (name: string) => void;
    setFavoriteTechnology: (tech: string) => void;
    setHobbies: (hobbies: string) => void;
    setWorry: (worry: string) => void;
    setNotifyTime: (time: string) => void;
    loadSettings: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set) => ({
    name: 'Guest User',
    favorite_technology: 'React Native',
    hobbies: 'Coding, Reading',
    worry: 'None',
    notify_time: '21:00',

    setName: (name) => {
        set({ name });
        AsyncStorage.setItem('userName', name);
    },
    setFavoriteTechnology: (tech) => {
        set({ favorite_technology: tech });
        // Store as array string for compatibility with setup.tsx logic
        AsyncStorage.setItem('techStack', JSON.stringify(tech.split(',').map(s => s.trim())));
    },
    setHobbies: (hobbies) => {
        set({ hobbies });
        AsyncStorage.setItem('hobbies', JSON.stringify(hobbies.split(',').map(s => s.trim())));
    },
    setWorry: (worry) => {
        set({ worry });
        AsyncStorage.setItem('worries', JSON.stringify(worry.split(',').map(s => s.trim())));
    },
    setNotifyTime: (notify_time) => {
        set({ notify_time });
        AsyncStorage.setItem('notifTime', notify_time);
    },

    loadSettings: async () => {
        try {
            const values = await AsyncStorage.multiGet([
                'userName', 'techStack', 'hobbies', 'worries', 'notifTime'
            ]);

            const data: any = {};
            values.forEach(([key, val]) => {
                if (val) data[key] = val;
            });

            // Parse Arrays
            const parseArray = (json: string) => {
                try {
                    const arr = JSON.parse(json);
                    return Array.isArray(arr) ? arr.join(', ') : json;
                } catch { return json; }
            };

            set({
                name: data.userName || 'Guest User',
                favorite_technology: data.techStack ? parseArray(data.techStack) : 'React Native',
                hobbies: data.hobbies ? parseArray(data.hobbies) : 'Coding',
                worry: data.worries ? parseArray(data.worries) : 'None',
                notify_time: data.notifTime || '21:00',
            });
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    }
}));
