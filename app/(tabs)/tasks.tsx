import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutRight, Layout } from 'react-native-reanimated';
import { useApp } from '../../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: Date.now().toString(),
        title: trimmed,
        completed: false,
        priority: 'medium',
        pomodorosTarget: 2,
        pomodorosCompleted: 0,
        createdAt: new Date().toISOString(),
      },
    });
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Colors.coral;
      case 'medium':
        return Colors.tertiary;
      case 'low':
        return Colors.mint;
      default:
        return Colors.outline;
    }
  };

  const renderPomodoroIndicators = (target: number, completed: number) => {
    const indicators = [];
    for (let i = 0; i < target; i++) {
      indicators.push(
        <View
          key={i}
          style={[
            styles.pomodoroCircle,
            i < completed
              ? styles.pomodoroFilled
              : styles.pomodoroEmpty,
          ]}
        />
      );
    }
    return indicators;
  };

  const renderTaskItem = ({ item, index }: { item: typeof state.tasks[0]; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      exiting={FadeOutRight.duration(300)}
      layout={Layout.springify()}
    >
      <View style={styles.taskCard}>
        <View style={styles.taskRow}>
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => toggleTask(item.id)}
            style={[
              styles.checkbox,
              item.completed && styles.checkboxCompleted,
            ]}
            activeOpacity={0.7}
          >
            {item.completed && (
              <Text style={styles.checkmark}>&#10003;</Text>
            )}
          </TouchableOpacity>

          {/* Task content */}
          <View style={styles.taskContent}>
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.taskTitleCompleted,
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View style={styles.taskMeta}>
              {/* Priority tag for high priority */}
              {item.priority === 'high' && (
                <View style={styles.priorityTag}>
                  <Text style={styles.priorityTagText}>HIGH PRIORITY</Text>
                </View>
              )}

              {/* Pomodoro indicators */}
              <View style={styles.pomodoroRow}>
                {renderPomodoroIndicators(item.pomodorosTarget, item.pomodorosCompleted)}
              </View>
            </View>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => deleteTask(item.id)}
            style={styles.deleteButton}
            activeOpacity={0.6}
          >
            <Text style={styles.deleteText}>&#x2715;</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>Prioritize and focus.</Text>
      </View>

      {/* Quick add bar */}
      <View style={styles.quickAddBar}>
        <TextInput
          style={styles.quickAddInput}
          placeholder="Add a new task..."
          placeholderTextColor={Colors.outline}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={addTask}
          style={styles.addButton}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      <FlatList
        data={state.tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks yet.</Text>
            <Text style={styles.emptySubtext}>
              Add a task above to get started.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.safeMargin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 40,
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  quickAddBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.safeMargin,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.base,
    paddingVertical: Spacing.base,
  },
  quickAddInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurface,
    paddingVertical: Spacing.base,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: Colors.onPrimary,
    lineHeight: 28,
  },
  listContent: {
    paddingHorizontal: Spacing.safeMargin,
    gap: Spacing.sm,
  },
  taskCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 20,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  taskContent: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.base,
  },
  taskTitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.base,
    gap: Spacing.base,
  },
  priorityTag: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priorityTagText: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.coral,
  },
  pomodoroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pomodoroCircle: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  pomodoroFilled: {
    backgroundColor: Colors.coral,
  },
  pomodoroEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.coral,
  },
  deleteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  deleteText: {
    color: Colors.outline,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: Colors.onSurfaceVariant,
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.outline,
    marginTop: Spacing.base,
  },
});
