import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';
import { useApp, Goal } from '../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const goalIcons: Record<string, string> = {
  code: '</> ',
  menu_book: '📖',
  fitness_center: '💪',
  brush: '🎨',
  school: '🎓',
  work: '💼',
};

const colorMap: Record<string, string> = {
  primary: Colors.primary,
  tertiary: Colors.tertiary,
  secondary: Colors.secondary,
};

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalMilestones, setNewGoalMilestones] = useState('5');

  const dailyProgress = state.timer.todayPomodoros / state.timer.dailyTarget;
  const weeklyProgress = state.timer.weeklyFocusMinutes / state.timer.weeklyGoalMinutes;

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      icon: 'code',
      target: newGoalTarget.trim() || 'No deadline',
      milestonesTotal: parseInt(newGoalMilestones) || 5,
      milestonesCompleted: 0,
      status: 'in_progress',
      color: ['primary', 'tertiary', 'secondary'][state.goals.length % 3] as Goal['color'],
    };
    dispatch({ type: 'ADD_GOAL', payload: goal });
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalMilestones('5');
    setShowAddModal(false);
  };

  const incrementMilestone = (goalId: string) => {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal || goal.milestonesCompleted >= goal.milestonesTotal) return;
    const newCompleted = goal.milestonesCompleted + 1;
    dispatch({
      type: 'UPDATE_GOAL',
      payload: {
        id: goalId,
        updates: {
          milestonesCompleted: newCompleted,
          status: newCompleted === goal.milestonesTotal ? 'completed' : goal.status,
        },
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals & Targets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily & Weekly Progress Cards */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.progressGrid}>
          {/* Daily Target */}
          <View style={styles.progressCard}>
            <View style={styles.progressGlow} />
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressLabel}>DAILY TARGET</Text>
                <Text style={styles.progressValue}>
                  {state.timer.todayPomodoros} / {state.timer.dailyTarget}
                </Text>
                <Text style={styles.progressSubtext}>Pomodoros completed</Text>
              </View>
              <Text style={styles.progressIcon}>🔥</Text>
            </View>
            <View style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(dailyProgress * 100, 100)}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: Colors.primary }]}>
              {Math.round(dailyProgress * 100)}%
            </Text>
          </View>

          {/* Weekly Target */}
          <View style={styles.progressCard}>
            <View style={[styles.progressGlow, { backgroundColor: `${Colors.tertiary}15` }]} />
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressLabel}>WEEKLY FOCUS</Text>
                <Text style={styles.progressValue}>
                  {Math.round(state.timer.weeklyFocusMinutes / 60)}h
                </Text>
                <Text style={styles.progressSubtext}>
                  Of {Math.round(state.timer.weeklyGoalMinutes / 60)}h goal
                </Text>
              </View>
              <Text style={styles.progressIcon}>📈</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(weeklyProgress * 100, 100)}%`,
                    backgroundColor: Colors.tertiary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: Colors.tertiary }]}>
              {Math.round(weeklyProgress * 100)}%
            </Text>
          </View>
        </Animated.View>

        {/* Long-Term Goals */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Long-Term Goals</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addButtonText}>+ NEW GOAL</Text>
            </TouchableOpacity>
          </View>

          {state.goals.map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.delay(300 + index * 100).springify()}
            >
              <TouchableOpacity
                style={styles.goalCard}
                onPress={() => incrementMilestone(goal.id)}
                activeOpacity={0.7}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <View
                      style={[
                        styles.goalIconContainer,
                        { backgroundColor: `${colorMap[goal.color]}20` },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {goalIcons[goal.icon] || '🎯'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalTarget}>Target: {goal.target}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: Colors.surfaceContainerHighest,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: colorMap[goal.color] }]}>
                      {goal.status === 'completed'
                        ? 'COMPLETED'
                        : goal.status === 'on_track'
                        ? 'ON TRACK'
                        : 'IN PROGRESS'}
                    </Text>
                  </View>
                </View>

                <View style={styles.milestonesContainer}>
                  <View style={styles.milestonesHeader}>
                    <Text style={styles.milestonesLabel}>Milestones</Text>
                    <Text style={styles.milestonesCount}>
                      {goal.milestonesCompleted}/{goal.milestonesTotal}
                    </Text>
                  </View>
                  <View style={styles.milestonesBar}>
                    {Array.from({ length: goal.milestonesTotal }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.milestoneSegment,
                          {
                            backgroundColor:
                              i < goal.milestonesCompleted
                                ? colorMap[goal.color]
                                : Colors.surfaceContainerHighest,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>❝</Text>
          <Text style={styles.quoteText}>
            Focus is a muscle. The more you work it, the stronger it gets. Every deep work session
            is an investment in your cognitive endurance.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.modalTitle}>New Goal</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Goal title..."
              placeholderTextColor={`${Colors.onSurfaceVariant}80`}
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Target date (e.g., Q4 2024)..."
              placeholderTextColor={`${Colors.onSurfaceVariant}80`}
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Number of milestones..."
              placeholderTextColor={`${Colors.onSurfaceVariant}80`}
              value={newGoalMilestones}
              onChangeText={setNewGoalMilestones}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddGoal}>
                <Text style={styles.modalSaveText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.safeMargin,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.onSurface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.safeMargin,
    paddingBottom: 40,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  progressCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  progressGlow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}15`,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  progressSubtext: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  progressIcon: {
    fontSize: 28,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
  },
  goalCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  goalTarget: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  milestonesLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  milestonesCount: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurface,
  },
  milestonesBar: {
    flexDirection: 'row',
    gap: 6,
  },
  milestoneSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  quoteCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  quoteIcon: {
    fontSize: 32,
    color: `${Colors.primary}50`,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surfaceContainerLow,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.md,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
});
