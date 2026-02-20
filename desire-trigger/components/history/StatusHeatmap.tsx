import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { HistoryLog } from '../../types';
import { METRIC_COLORS, METRIC_LABELS } from '../../constants/mockData';

interface StatusHeatmapProps {
    data: HistoryLog[];
    displayMonth: Date; // The month to display
    onDayPress: (day: HistoryLog) => void;
    selectedDate: string | null;
}

const EMPTY_COLOR = '#334155'; // Slate-700 for empty days
const BORDER_COLOR_SELECTED = '#FFFFFF';

// 日本語名から PrimaryMetric へのマッピング
const japaneseToPrimaryMetric: Record<string, keyof typeof METRIC_COLORS> = {
    '探索': 'exploration',
    '没頭': 'immersion',
    '整理': 'refactor',
    '貢献': 'contribution',
    '元気': 'idle',
};

export default function StatusHeatmap({ data, displayMonth, onDayPress, selectedDate }: StatusHeatmapProps) {

    const targetDate = displayMonth;
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth(); // 0-indexed

    // Get all days in the month (TimeZone Safe)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Find which day of the week the 1st falls on (0 = Sunday, 1 = Monday ...)
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const fullMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const m = month + 1;
        const y = year;
        return {
            dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            dayNum: d
        };
    });

    // Layout constants
    const screenWidth = Dimensions.get('window').width;
    const padding = 48; // history screen padding (24 * 2)
    const gap = 8;
    const columns = 7;
    const layoutWidth = screenWidth - padding;
    const totalGapSpace = gap * (columns - 1);
    const cellSize = Math.floor((layoutWidth - totalGapSpace) / columns);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <View>
            {/* Weekday Header */}
            <View style={{ flexDirection: 'row', gap: gap, marginBottom: 8 }}>
                {weekDays.map((day) => (
                    <View key={day} style={{ width: cellSize, alignItems: 'center' }}>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase">{day}</Text>
                    </View>
                ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: gap }}>

                {/* Empty slots for days before the 1st */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <View key={`empty-${i}`} style={{ width: cellSize, height: cellSize }} />
                ))}

                {fullMonthDays.map(({ dateStr, dayNum }) => {
                    const log = data.find(d => d.date === dateStr);
                    const isSelected = dateStr === selectedDate;

                    // dominantMetric（日本語）をPrimaryMetricに変換して色を取得
                    let color = EMPTY_COLOR;
                    if (log && log.dominantMetric) {
                        const metricKey = japaneseToPrimaryMetric[log.dominantMetric];
                        color = metricKey ? METRIC_COLORS[metricKey] : EMPTY_COLOR;
                    }

                    const dayPayload: HistoryLog = log || {
                        date: dateStr,
                        dominantMetric: '元気',
                        hasQuestions: false,
                        hasTasks: false,
                        score: 0,
                    };

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            onPress={() => onDayPress(dayPayload)}
                            style={{
                                width: cellSize,
                                height: cellSize, // Explicitly set height equal to width
                                backgroundColor: color,
                                borderRadius: 4,
                                borderWidth: isSelected ? 2 : 0,
                                borderColor: BORDER_COLOR_SELECTED,
                                opacity: log ? 0.9 : 0.3,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text className="text-white/40 text-[10px] font-bold">
                                {dayNum}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
