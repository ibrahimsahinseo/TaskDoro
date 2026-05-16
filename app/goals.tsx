import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation, Goal } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const goalIcons: Record<string, string> = { code: '</> ', menu_book: '📖', fitness_center: '💪', brush: '🎨', school: '🎓', work: '💼' };

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalMilestones, setNewGoalMilestones] = useState('5');

  const colorMap: Record<string, string> = { primary: c.primary, tertiary: c.tertiary, secondary: c.secondary };
  const dailyProgress = state.timer.todayPomodoros / state.timer.dailyTarget;
  const weeklyProgress = state.timer.weeklyFocusMinutes / state.timer.weeklyGoalMinutes;

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;
    dispatch({ type: 'ADD_GOAL', payload: { id: Date.now().toString(), title: newGoalTitle.trim(), icon: 'code', target: newGoalTarget.trim() || 'No deadline', milestonesTotal: parseInt(newGoalMilestones) || 5, milestonesCompleted: 0, status: 'in_progress', color: ['primary', 'tertiary', 'secondary'][state.goals.length % 3] as Goal['color'] } });
    setNewGoalTitle(''); setNewGoalTarget(''); setNewGoalMilestones('5'); setShowAddModal(false);
  };

  const incrementMilestone = (goalId: string) => {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal || goal.milestonesCompleted >= goal.milestonesTotal) return;
    const nc = goal.milestonesCompleted + 1;
    dispatch({ type: 'UPDATE_GOAL', payload: { id: goalId, updates: { milestonesCompleted: nc, status: nc === goal.milestonesTotal ? 'completed' : goal.status } } });
  };

  const statusText = (s: string) => s === 'completed' ? t.completed : s === 'on_track' ? t.onTrack : t.inProgress;

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant + '20' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text style={[styles.backIcon, { color: c.onSurface }]}>←</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.goalsTargets}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.progressGrid}>
          <View style={[styles.progressCard, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant + '20' }]}>
            <View style={[styles.progressGlow, { backgroundColor: `${c.primary}15` }]} />
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.progressLabel, { color: c.onSurfaceVariant }]}>{t.dailyTarget}</Text>
                <Text style={[styles.progressValue, { color: c.onSurface }]}>{state.timer.todayPomodoros} / {state.timer.dailyTarget}</Text>
                <Text style={[styles.progressSubtext, { color: c.onSurfaceVariant }]}>{t.pomodorosCompleted}</Text>
              </View>
              <Text style={styles.progressIcon}>🔥</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: c.surfaceContainerLowest }]}>
              <View style={[styles.progressBarFill, { width: `${Math.min(dailyProgress * 100, 100)}%`, backgroundColor: c.primary }]} />
            </View>
            <Text style={[styles.progressPercent, { color: c.primary }]}>{Math.round(dailyProgress * 100)}%</Text>
          </View>

          <View style={[styles.progressCard, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant + '20' }]}>
            <View style={[styles.progressGlow, { backgroundColor: `${c.tertiary}15` }]} />
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.progressLabel, { color: c.onSurfaceVariant }]}>{t.weeklyFocus}</Text>
                <Text style={[styles.progressValue, { color: c.onSurface }]}>{Math.round(state.timer.weeklyFocusMinutes / 60)}h</Text>
                <Text style={[styles.progressSubtext, { color: c.onSurfaceVariant }]}>{t.ofGoal.replace('{hours}', String(Math.round(state.timer.weeklyGoalMinutes / 60)))}</Text>
              </View>
              <Text style={styles.progressIcon}>📈</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: c.surfaceContainerLowest }]}>
              <View style={[styles.progressBarFill, { width: `${Math.min(weeklyProgress * 100, 100)}%`, backgroundColor: c.tertiary }]} />
            </View>
            <Text style={[styles.progressPercent, { color: c.tertiary }]}>{Math.round(weeklyProgress * 100)}%</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.longTermGoals}</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: c.primary }]} onPress={() => setShowAddModal(true)}>
              <Text style={[styles.addButtonText, { color: c.onPrimary }]}>{t.newGoal}</Text>
            </TouchableOpacity>
          </View>

          {state.goals.map((goal, index) => (
            <Animated.View key={goal.id} entering={FadeInDown.delay(300 + index * 100).springify()}>
              <TouchableOpacity style={[styles.goalCard, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]} onPress={() => incrementMilestone(goal.id)} activeOpacity={0.7}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <View style={[styles.goalIconContainer, { backgroundColor: `${colorMap[goal.color]}20` }]}>
                      <Text style={{ fontSize: 20 }}>{goalIcons[goal.icon] || '🎯'}</Text>
                    </View>
                    <View>
                      <Text style={[styles.goalTitle, { color: c.onSurface }]}>{goal.title}</Text>
                      <Text style={[styles.goalTarget, { color: c.onSurfaceVariant }]}>{t.target} {goal.target}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: c.surfaceContainerHighest }]}>
                    <Text style={[styles.statusText, { color: colorMap[goal.color] }]}>{statusText(goal.status)}</Text>
                  </View>
                </View>
                <View style={styles.milestonesContainer}>
                  <View style={styles.milestonesHeader}>
                    <Text style={[styles.milestonesLabel, { color: c.onSurfaceVariant }]}>{t.milestones}</Text>
                    <Text style={[styles.milestonesCount, { color: c.onSurface }]}>{goal.milestonesCompleted}/{goal.milestonesTotal}</Text>
                  </View>
                  <View style={styles.milestonesBar}>
                    {Array.from({ length: goal.milestonesTotal }).map((_, i) => (
                      <View key={i} style={[styles.milestoneSegment, { backgroundColor: i < goal.milestonesCompleted ? colorMap[goal.color] : c.surfaceContainerHighest }]} />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={[styles.quoteCard, { backgroundColor: c.surfaceContainerLowest, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.quoteIcon, { color: `${c.primary}50` }]}>❝</Text>
          <Text style={[styles.quoteText, { color: c.onSurfaceVariant }]}>{t.quoteText}</Text>
        </Animated.View>
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surfaceContainerLow, paddingBottom: insets.bottom + 20 }]}>
            <Text style={[styles.modalTitle, { color: c.onSurface }]}>{t.newGoalTitle}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '20' }]} placeholder={t.goalTitlePlaceholder} placeholderTextColor={`${c.onSurfaceVariant}80`} value={newGoalTitle} onChangeText={setNewGoalTitle} />
            <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '20' }]} placeholder={t.targetDatePlaceholder} placeholderTextColor={`${c.onSurfaceVariant}80`} value={newGoalTarget} onChangeText={setNewGoalTarget} />
            <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '20' }]} placeholder={t.milestonesPlaceholder} placeholderTextColor={`${c.onSurfaceVariant}80`} value={newGoalMilestones} onChangeText={setNewGoalMilestones} keyboardType="numeric" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: c.outlineVariant }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.modalCancelText, { color: c.onSurface }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: c.primary }]} onPress={handleAddGoal}>
                <Text style={[styles.modalSaveText, { color: c.onPrimary }]}>{t.createGoal}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.safeMargin, height: 56, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.safeMargin, paddingBottom: 40 },
  progressGrid: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  progressCard: { flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, overflow: 'hidden' },
  progressGlow: { position: 'absolute', right: -40, top: -40, width: 120, height: 120, borderRadius: 60 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  progressLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  progressValue: { fontSize: 22, fontWeight: '700' },
  progressSubtext: { fontSize: 13, marginTop: 2 },
  progressIcon: { fontSize: 28 },
  progressBarBg: { height: 8, borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPercent: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textAlign: 'right' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.full },
  addButtonText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  goalCard: { borderRadius: BorderRadius.xl, padding: 20, borderWidth: 1, marginBottom: Spacing.sm },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  goalInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  goalIconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  goalTitle: { fontSize: 16, fontWeight: '600' },
  goalTarget: { fontSize: 14, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  milestonesContainer: { marginTop: 8 },
  milestonesHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  milestonesLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  milestonesCount: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  milestonesBar: { flexDirection: 'row', gap: 6 },
  milestoneSegment: { flex: 1, height: 6, borderRadius: 3 },
  quoteCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, alignItems: 'center', marginTop: Spacing.md },
  quoteIcon: { fontSize: 32, marginBottom: 8 },
  quoteText: { fontSize: 16, lineHeight: 26, fontStyle: 'italic', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.md },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.md },
  modalInput: { borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, borderWidth: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: BorderRadius.full, borderWidth: 1, alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '600' },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center' },
  modalSaveText: { fontSize: 14, fontWeight: '600' },
});
