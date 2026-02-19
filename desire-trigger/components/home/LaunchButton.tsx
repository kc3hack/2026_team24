import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Props = {
    isDiagnosed: boolean;
    onPress: () => void;
    showTooltip?: boolean;
};

export default function LaunchButton({ isDiagnosed, onPress, showTooltip }: Props) {

    const handlePress = () => {
        if (isDiagnosed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onPress();
    };

    return (
        <View className="items-center justify-center mb-10">
            {showTooltip && !isDiagnosed && (
                <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipText}>タップして今日の診断を開始</Text>
                    <View style={styles.tooltipArrow} />
                </View>
            )}

            <Pressable
                onPress={handlePress}
                className={`w-48 h-48 rounded-full bg-gray-900 border-4 ${isDiagnosed ? 'border-green-500' : 'border-[#3B82F6]'} items-center justify-center shadow-lg ${isDiagnosed ? 'shadow-green-500/50' : 'shadow-blue-500/50'}`}
                style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    opacity: pressed ? 0.8 : 1
                })}
            >
                {/* Rings */}
                <View className={`absolute w-56 h-56 border ${isDiagnosed ? 'border-green-500/20' : 'border-[#3B82F6]/20'} rounded-full animate-pulse`} />
                <View className={`absolute w-64 h-64 border ${isDiagnosed ? 'border-green-500/10' : 'border-[#3B82F6]/10'} rounded-full`} />

                <Feather
                    name={isDiagnosed ? "check" : "activity"}
                    size={48}
                    color={isDiagnosed ? "#22c55e" : "white"}
                    style={{ marginBottom: 8 }}
                />

                <Text className={`${isDiagnosed ? 'text-green-500' : 'text-white'} text-xl font-bold tracking-widest`}>
                    {isDiagnosed ? "COMPLETE" : "LAUNCH"}
                </Text>

                <Text className={`${isDiagnosed ? 'text-green-500/60' : 'text-[#3B82F6]'} text-[10px] font-bold mt-1`}>
                    {isDiagnosed ? "DIAGNOSED" : "DIAGNOSTIC"}
                </Text>
            </Pressable>

            <Text className="text-gray-500 text-xs mt-6">
                {isDiagnosed ? "本日の診断は完了しました" : "タップして診断を開始"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    tooltipContainer: {
        position: 'absolute',
        top: -50,
        backgroundColor: '#3B82F6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        zIndex: 10,
    },
    tooltipText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tooltipArrow: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -6,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#3B82F6',
    },
});
