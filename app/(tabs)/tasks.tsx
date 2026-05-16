import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutRight, Layout } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation } from '../../contexts/AppContext';
import { Spacing, BorderRadius } from '../../constants/theme';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_TASK', payload: { id: Date.now().toString(), title: trimmed, completed: false, priority: 'medium', pomodorosTarget: 2, pomodorosCompleted: 0, createdAt: new Date().toISOString() } });
    setNewTaskTitle('');
  };

  const renderTaskItem = ({ item, index }: { item: typeof state.tasks[0]; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} exiting={FadeOutRight.duration(300)} layout={Layout.springify()}>
      <View style={[styles.taskCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
        <View style={styles.taskRow}>
          <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_TASK', payload: item.id })} style={[styles.checkbox, { borderColor: c.outlineVariant }, item.completed && { backgroundColor: c.primary, borderColor: c.primary }]} activeOpacity={0.7}>
            {item.completed && <Text style={[styles.checkmark, { color: c.onPrimary }]}>&#10003;</Text>}
          </TouchableOpacity>
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, { color: c.onSurface }, item.completed && styles.taskTitleCompleted]} numberOfLines={2}>{item.title}</Text>
            <View style={styles.taskMeta}>
              {item.priority === 'high' && (
                <View style={[styles.priorityTag, { backgroundColor: c.surfaceContainer }]}>
                  <Text style={[styles.priorityTagText, { color: c.coral }]}>{t.highPriority}</Text>
                </View>
              )}
              <View style={styles.pomodoroRow}>
                {Array.from({ length: item.pomodorosTarget }).map((_, i) => (
                  <View key={i} style={[styles.pomodoroCircle, i < item.pomodorosCompleted ? { backgroundColor: c.coral } : { borderWidth: 1.5, borderColor: c.coral }]} />
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_TASK', payload: item.id })} style={styles.deleteButton} activeOpacity={0.6}>
            <Text style={[styles.deleteText, { color: c.outline }]}>&#x2715;</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.tasksTitle}</Text>
        <Text style={[styles.headerSubtitle, { color: c.onSurfaceVariant }]}>{t.tasksSubtitle}</Text>
      </View>
      <View style={[styles.quickAddBar, { backgroundColor: c.cardBg }]}>
        <TextInput style={[styles.quickAddInput, { color: c.onSurface }]} placeholder={t.addNewTask} placeholderTextColor={c.outline} value={newTaskTitle} onChangeText={setNewTaskTitle} onSubmitEditing={addTask} returnKeyType="done" />
        <TouchableOpacity onPress={addTask} style={[styles.addButton, { backgroundColor: c.primary }]} activeOpacity={0.7}>
          <Text style={[styles.addButtonText, { color: c.onPrimary }]}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={state.tasks} keyExtractor={(item) => item.id} renderItem={renderTaskItem} contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>{t.noTasksYet}</Text>
            <Text style={[styles.emptySubtext, { color: c.outline }]}>{t.addTaskHint}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.safeMargin, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  headerSubtitle: { fontSize: 16, lineHeight: 24, marginTop: Spacing.xs },
  quickAddBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.safeMargin, marginTop: Spacing.sm, marginBottom: Spacing.md, borderRadius: BorderRadius.xl, paddingLeft: Spacing.md, paddingRight: Spacing.base, paddingVertical: Spacing.base },
  quickAddInput: { flex: 1, fontSize: 16, lineHeight: 24, paddingVertical: Spacing.base },
  addButton: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { fontSize: 24, fontWeight: '700', lineHeight: 28 },
  listContent: { paddingHorizontal: Spacing.safeMargin, gap: Spacing.sm },
  taskCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: 20 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderRadius: BorderRadius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkmark: { fontSize: 14, fontWeight: '700', lineHeight: 16 },
  taskContent: { flex: 1, marginLeft: Spacing.sm, marginRight: Spacing.base },
  taskTitle: { fontSize: 18, lineHeight: 28 },
  taskTitleCompleted: { textDecorationLine: 'line-through', opacity: 0.5 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.base, gap: Spacing.base },
  priorityTag: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  priorityTagText: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  pomodoroRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pomodoroCircle: { width: 10, height: 10, borderRadius: BorderRadius.full },
  deleteButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14, marginTop: Spacing.base },
});
