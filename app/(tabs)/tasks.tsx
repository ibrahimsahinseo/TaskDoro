import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutRight, Layout } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useApp, useThemeColors, useTranslation, Task } from '../../contexts/AppContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const CATEGORIES = [
  { id: 'work', icon: '💼', color: '#FF6B6B' },
  { id: 'study', icon: '📚', color: '#45B7D1' },
  { id: 'coding', icon: '💻', color: '#4ECDC4' },
  { id: 'reading', icon: '📖', color: '#96CEB4' },
  { id: 'design', icon: '🎨', color: '#DDA0DD' },
  { id: 'writing', icon: '✍️', color: '#F7DC6F' },
  { id: 'meeting', icon: '🤝', color: '#85C1E9' },
  { id: 'personal', icon: '🏠', color: '#98D8C8' },
];

const TASK_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'newest' | 'priority' | 'due';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New task form
  const [formTitle, setFormTitle] = useState('');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formPomodoros, setFormPomodoros] = useState('2');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('');
  const [formCategory, setFormCategory] = useState('work');
  const [formColor, setFormColor] = useState(TASK_COLORS[0]);
  const [formNotes, setFormNotes] = useState('');

  const getCategoryLabel = (catId: string) => {
    const map: Record<string, string> = { work: t.tagWork, study: t.tagStudy, coding: t.tagCoding, reading: t.tagReading, design: t.tagDesign, writing: t.tagWriting, meeting: t.tagMeeting, personal: t.profile };
    return map[catId] || catId;
  };

  const filteredTasks = useMemo(() => {
    let tasks = [...state.tasks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }
    if (filter === 'active') tasks = tasks.filter((t) => !t.completed);
    if (filter === 'completed') tasks = tasks.filter((t) => t.completed);
    if (sort === 'priority') {
      const pMap = { high: 0, medium: 1, low: 2 };
      tasks.sort((a, b) => pMap[a.priority] - pMap[b.priority]);
    } else if (sort === 'due') {
      tasks.sort((a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1);
    }
    return tasks;
  }, [state.tasks, filter, sort, searchQuery]);

  const taskCounts = useMemo(() => ({
    all: state.tasks.length,
    active: state.tasks.filter((t) => !t.completed).length,
    completed: state.tasks.filter((t) => t.completed).length,
  }), [state.tasks]);

  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle(''); setFormPriority('medium'); setFormPomodoros('2');
    setFormDueDate(''); setFormDueTime(''); setFormCategory('work');
    setFormColor(TASK_COLORS[0]); setFormNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title); setFormPriority(task.priority);
    setFormPomodoros(String(task.pomodorosTarget));
    setFormDueDate(task.dueDate || ''); setFormDueTime(task.dueTime || '');
    setFormCategory(task.category || 'work'); setFormColor(task.color || TASK_COLORS[0]);
    setFormNotes(task.notes || '');
    setShowAddModal(true);
  };

  const scheduleTaskReminder = useCallback((title: string, dueDate: string, dueTime?: string) => {
    try {
      const [year, month, day] = dueDate.split('-').map(Number);
      const [hours, mins] = dueTime ? dueTime.split(':').map(Number) : [9, 0];
      const triggerDate = new Date(year, month - 1, day, hours, mins);
      const reminderDate = new Date(triggerDate.getTime() - 30 * 60 * 1000);
      if (reminderDate > new Date()) {
        Notifications.scheduleNotificationAsync({
          content: { title: '📋 ' + title, body: `Due at ${dueTime || '09:00'}`, sound: 'default' },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
        }).catch(() => {});
      }
    } catch {}
  }, []);

  const handleSaveTask = () => {
    if (!formTitle.trim()) return;
    const poms = parseInt(formPomodoros) || 2;
    if (editingTask) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: editingTask.id, updates: { title: formTitle.trim(), priority: formPriority, pomodorosTarget: poms, dueDate: formDueDate || undefined, dueTime: formDueTime || undefined, category: formCategory, color: formColor, estimatedMinutes: poms * state.settings.focusDuration, notes: formNotes || undefined } } });
    } else {
      dispatch({ type: 'ADD_TASK', payload: { id: Date.now().toString(), title: formTitle.trim(), completed: false, priority: formPriority, pomodorosTarget: poms, pomodorosCompleted: 0, createdAt: new Date().toISOString(), category: formCategory, color: formColor, dueDate: formDueDate || undefined, dueTime: formDueTime || undefined, estimatedMinutes: poms * state.settings.focusDuration, tags: [formCategory], notes: formNotes || undefined } });
    }
    if (formDueDate) scheduleTaskReminder(formTitle.trim(), formDueDate, formDueTime || undefined);
    setShowAddModal(false);
  };

  const getDueLabel = (task: Task) => {
    if (!task.dueDate) return null;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (task.dueDate < today) return { text: t.overdue, color: c.error };
    if (task.dueDate === today) return { text: t.dueToday, color: c.coral };
    if (task.dueDate === tomorrow) return { text: t.dueTomorrow, color: c.tertiary };
    return { text: task.dueDate, color: c.onSurfaceVariant };
  };

  const priorityConfig = {
    high: { label: t.highPriority, color: c.coral },
    medium: { label: t.mediumPriority, color: c.tertiary },
    low: { label: t.lowPriority, color: c.mint },
  };

  const renderTaskItem = ({ item, index }: { item: Task; index: number }) => {
    const dueLabel = getDueLabel(item);
    const catData = CATEGORIES.find((cat) => cat.id === item.category);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()} exiting={FadeOutRight.duration(300)} layout={Layout.springify()}>
        <TouchableOpacity style={[styles.taskCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]} onPress={() => openEditModal(item)} activeOpacity={0.7}>
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_TASK', payload: item.id })} style={[styles.checkbox, { borderColor: item.color || c.outlineVariant }, item.completed && { backgroundColor: item.color || c.primary, borderColor: item.color || c.primary }]} activeOpacity={0.7}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <View style={styles.taskTitleRow}>
                <Text style={[styles.taskTitle, { color: c.onSurface }, item.completed && styles.taskTitleCompleted]} numberOfLines={2}>{item.title}</Text>
              </View>
              <View style={styles.taskMeta}>
                {catData && (
                  <View style={[styles.categoryTag, { backgroundColor: `${catData.color}20` }]}>
                    <Text style={styles.categoryIcon}>{catData.icon}</Text>
                    <Text style={[styles.categoryText, { color: catData.color }]}>{getCategoryLabel(item.category)}</Text>
                  </View>
                )}
                <View style={[styles.priorityTag, { backgroundColor: `${priorityConfig[item.priority].color}15` }]}>
                  <Text style={[styles.priorityTagText, { color: priorityConfig[item.priority].color }]}>{priorityConfig[item.priority].label}</Text>
                </View>
                {dueLabel && (
                  <View style={[styles.dueTag, { backgroundColor: `${dueLabel.color}15` }]}>
                    <Text style={[styles.dueTagText, { color: dueLabel.color }]}>{dueLabel.text}</Text>
                  </View>
                )}
              </View>
              <View style={styles.taskBottom}>
                <View style={styles.pomodoroRow}>
                  {Array.from({ length: item.pomodorosTarget }).map((_, i) => (
                    <View key={i} style={[styles.pomodoroCircle, i < item.pomodorosCompleted ? { backgroundColor: item.color || c.coral } : { borderWidth: 1.5, borderColor: item.color || c.coral }]} />
                  ))}
                </View>
                <Text style={[styles.estTime, { color: c.onSurfaceVariant }]}>{item.estimatedMinutes || item.pomodorosTarget * 25} {t.minutesShort}</Text>
                {item.dueTime && <Text style={[styles.dueTimeText, { color: c.onSurfaceVariant }]}>⏰ {item.dueTime}</Text>}
              </View>
            </View>
            <View style={[styles.colorStripe, { backgroundColor: item.color || c.primary }]} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.tasksTitle}</Text>
          <Text style={[styles.headerSubtitle, { color: c.onSurfaceVariant }]}>{t.tasksSubtitle}</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: c.primary }]} onPress={openAddModal}>
          <Text style={[styles.addBtnText, { color: c.onPrimary }]}>+ {t.newTask}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
        <Text style={{ fontSize: 14, marginRight: 8 }}>🔍</Text>
        <TextInput style={[styles.searchInput, { color: c.onSurface }]} placeholder={t.addNewTask} placeholderTextColor={c.onSurfaceVariant + '60'} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}><Text style={{ color: c.onSurfaceVariant }}>✕</Text></TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }, filter === f && { backgroundColor: `${c.primary}20`, borderColor: c.primary }]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, { color: c.onSurfaceVariant }, filter === f && { color: c.primary }]}>
              {f === 'all' ? t.allTasks : f === 'active' ? t.activeTasks : t.completedFilter} ({taskCounts[f]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortContent}>
        {(['newest', 'priority', 'due'] as SortType[]).map((s) => (
          <TouchableOpacity key={s} style={[styles.sortChip, { borderColor: c.outlineVariant + '30' }, sort === s && { borderColor: c.tertiary }]} onPress={() => setSort(s)}>
            <Text style={[styles.sortText, { color: c.onSurfaceVariant }, sort === s && { color: c.tertiary }]}>
              {s === 'newest' ? t.sortNewest : s === 'priority' ? t.sortPriority : t.sortDue}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList data={filteredTasks} keyExtractor={(item) => item.id} renderItem={renderTaskItem} contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>{t.noTasksYet}</Text>
            <Text style={[styles.emptySubtext, { color: c.outline }]}>{t.addTaskHint}</Text>
          </View>
        }
      />

      {/* Add/Edit Task Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContent, { backgroundColor: c.surfaceContainerLow }]} contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalHandle, { backgroundColor: c.outlineVariant }]} />
            <Text style={[styles.modalTitle, { color: c.onSurface }]}>{editingTask ? t.editTask : t.newTask}</Text>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.taskTitleLabel}</Text>
            <TextInput style={[styles.input, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '40' }]} placeholder={t.taskTitlePlaceholder} placeholderTextColor={c.outline} value={formTitle} onChangeText={setFormTitle} />

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.priority}</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as const).map((p) => (
                <TouchableOpacity key={p} style={[styles.priorityBtn, { borderColor: c.outlineVariant + '30' }, formPriority === p && { backgroundColor: `${priorityConfig[p].color}20`, borderColor: priorityConfig[p].color }]} onPress={() => setFormPriority(p)}>
                  <Text style={[styles.priorityBtnText, { color: c.onSurfaceVariant }, formPriority === p && { color: priorityConfig[p].color }]}>
                    {p === 'high' ? `🔴 ${t.high}` : p === 'medium' ? `🟡 ${t.medium}` : `🟢 ${t.low}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.estimatedPomodoros}</Text>
            <View style={styles.pomodoroSelector}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <TouchableOpacity key={n} style={[styles.pomBtn, { borderColor: c.outlineVariant + '30' }, parseInt(formPomodoros) === n && { backgroundColor: `${c.coral}20`, borderColor: c.coral }]} onPress={() => setFormPomodoros(String(n))}>
                  <Text style={[styles.pomBtnText, { color: c.onSurfaceVariant }, parseInt(formPomodoros) === n && { color: c.coral }]}>🍅 {n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.estLabel, { color: c.outline }]}>{t.estimatedTime}: {(parseInt(formPomodoros) || 2) * state.settings.focusDuration} {t.minutesShort}</Text>

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.dueDate}</Text>
                <TextInput style={[styles.input, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '40' }]} placeholder={t.dueDatePlaceholder} placeholderTextColor={c.outline} value={formDueDate} onChangeText={setFormDueDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.dueTime}</Text>
                <TextInput style={[styles.input, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '40' }]} placeholder={t.dueTimePlaceholder} placeholderTextColor={c.outline} value={formDueTime} onChangeText={setFormDueTime} />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.category}</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={[styles.categoryBtn, { borderColor: c.outlineVariant + '30' }, formCategory === cat.id && { backgroundColor: `${cat.color}20`, borderColor: cat.color }]} onPress={() => setFormCategory(cat.id)}>
                  <Text style={styles.categoryBtnIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryBtnText, { color: c.onSurfaceVariant }, formCategory === cat.id && { color: cat.color }]}>{getCategoryLabel(cat.id)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.selectColor}</Text>
            <View style={styles.colorRow}>
              {TASK_COLORS.map((color) => (
                <TouchableOpacity key={color} style={[styles.colorDot, { backgroundColor: color }, formColor === color && styles.colorDotSelected]} onPress={() => setFormColor(color)} />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={handleSaveTask}>
                <Text style={[styles.saveBtnText, { color: c.onPrimary }]}>{t.saveTask}</Text>
              </TouchableOpacity>
              {editingTask && (
                <TouchableOpacity style={[styles.deleteBtn, { borderColor: c.error }]} onPress={() => { dispatch({ type: 'DELETE_TASK', payload: editingTask.id }); setShowAddModal(false); }}>
                  <Text style={[styles.deleteBtnText, { color: c.error }]}>{t.deleteTask}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.outlineVariant }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.cancelBtnText, { color: c.onSurfaceVariant }]}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.safeMargin, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  headerSubtitle: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.full },
  addBtnText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.safeMargin, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.safeMargin, gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  sortRow: { maxHeight: 36, marginBottom: Spacing.sm },
  sortContent: { paddingHorizontal: Spacing.safeMargin, gap: 8 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  sortText: { fontSize: 11, fontWeight: '600' },
  listContent: { paddingHorizontal: Spacing.safeMargin, gap: Spacing.sm },
  taskCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: 16, overflow: 'hidden' },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderRadius: BorderRadius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkmark: { fontSize: 13, fontWeight: '700', color: '#fff' },
  taskContent: { flex: 1, marginLeft: Spacing.sm, marginRight: 4 },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  taskTitle: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  taskTitleCompleted: { textDecorationLine: 'line-through', opacity: 0.5 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  categoryTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  categoryIcon: { fontSize: 10 },
  categoryText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  priorityTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  dueTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dueTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  taskBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pomodoroRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pomodoroCircle: { width: 8, height: 8, borderRadius: BorderRadius.full },
  estTime: { fontSize: 11, fontWeight: '600' },
  dueTimeText: { fontSize: 11, fontWeight: '600' },
  colorStripe: { width: 4, borderRadius: 2, alignSelf: 'stretch', marginLeft: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14, marginTop: Spacing.base },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Spacing.md },
  modalScroll: { paddingBottom: 40, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, marginBottom: 12 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priorityBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  priorityBtnText: { fontSize: 12, fontWeight: '600' },
  pomodoroSelector: { flexDirection: 'row', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  pomBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  pomBtnText: { fontSize: 13, fontWeight: '600' },
  estLabel: { fontSize: 11, marginBottom: 12, marginTop: 4 },
  dateRow: { flexDirection: 'row', gap: 12 },
  categoryRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, gap: 4 },
  categoryBtnIcon: { fontSize: 14 },
  categoryBtnText: { fontSize: 11, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  modalActions: { gap: 10, marginTop: 8 },
  saveBtn: { paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700' },
  deleteBtn: { paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center', borderWidth: 1 },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
  cancelBtn: { paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
});
