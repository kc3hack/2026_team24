import React, { useState } from 'react';
import { View, StyleSheet, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { TaskCarousel } from '../../components/action/TaskCarousel';
import { TaskDetailModal } from '../../components/action/TaskDetailModal';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types';

export default function ActionScreen() {
    const { tasks, completeTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleCommit = (taskId: string) => {
        completeTask(taskId);
        setSelectedTask(null);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>ACTION_PROTOCOL</Text>
                <Text style={styles.headerSubtitle}>最適化された行動プラン</Text>
            </View>

            <View style={styles.carouselContainer}>
                <TaskCarousel
                    tasks={tasks}
                    onTaskPress={setSelectedTask}
                />
            </View>

            <TaskDetailModal
                visible={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onCommit={handleCommit}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.text,
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    headerSubtitle: {
        color: Colors.textDim,
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 1,
    },
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // Pure centering for Card Stack
    },
});
