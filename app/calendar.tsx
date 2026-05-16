import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation, PlannedSession } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const TAG_COLORS: Record<string, string> = { work: '#FF6B6B', study: '#45B7D1', coding: '#4ECDC4', reading: '#96CEB4', design: '#DDA0DD', writing: '#F7DC6F', meeting: '#85C1E9', exercise: '#98D8C8', creative: '#BB8FCE', other: '#FFEAA7' };
const TAGS = ['work', 'study', 'coding', 'reading', 'design', 'writing', 'meeting', 'exercise', 'creative', 'other'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#F7DC6F', '#85C1E9', '#98D8C8', '#BB8FCE', '#FFEAA7'];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();

  const MONTHS = [t.january, t.february, t.march, t.april, t.may, t.june, t.july, t.august, t.september, t.october, t.november, t.december];
  const DAYS_HEADER = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<PlannedSession | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTag, setSessionTag] = useState('work');
  const [sessionColor, setSessionColor] = useState(COLORS[0]);
  const [sessionStartTime, setSessionStartTime] = useState('09:00');
  const [sessionEndTime, setSessionEndTime] = useState('10:00');

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = now.getDate();
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const selectedDateStr = useMemo(() => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }, [currentYear, currentMonth, selectedDay]);

  const sessionsForSelectedDay = useMemo(() => {
    return state.plannedSessions.filter((s) => s.date === selectedDateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [state.plannedSessions, selectedDateStr]);

  const completedSessionsForDay = useMemo(() => {
    return state.sessions.filter((s) => s.date === selectedDateStr && s.type === 'focus');
  }, [state.sessions, selectedDateStr]);

  const daysWithSessions = useMemo(() => {
    const days = new Set<number>();
    state.plannedSessions.forEach((s) => {
      const d = new Date(s.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        days.add(d.getDate());
      }
    });
    state.sessions.forEach((s) => {
      const d = new Date(s.completedAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        days.add(d.getDate());
      }
    });
    return days;
  }, [state.plannedSessions, state.sessions, currentYear, currentMonth]);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const cellSize = (width - 40 - 12) / 7;

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const openAddModal = useCallback(() => {
    setEditingSession(null);
    setSessionTitle('');
    setSessionTag('work');
    setSessionColor(COLORS[0]);
    setSessionStartTime('09:00');
    setSessionEndTime('10:00');
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((session: PlannedSession) => {
    setEditingSession(session);
    setSessionTitle(session.title);
    setSessionTag(session.tag);
    setSessionColor(session.color);
    setSessionStartTime(session.startTime);
    setSessionEndTime(session.endTime);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!sessionTitle.trim()) return;
    if (editingSession) {
      dispatch({ type: 'DELETE_PLANNED_SESSION', payload: editingSession.id });
    }
    const newSession: PlannedSession = {
      id: editingSession?.id || Date.now().toString(),
      title: sessionTitle.trim(),
      date: selectedDateStr,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      tag: sessionTag,
      color: sessionColor,
    };
    dispatch({ type: 'ADD_PLANNED_SESSION', payload: newSession });
    setModalVisible(false);
  }, [sessionTitle, selectedDateStr, sessionStartTime, sessionEndTime, sessionTag, sessionColor, editingSession, dispatch]);

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PLANNED_SESSION', payload: id });
  }, [dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant + '20' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: c.onSurface }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.calendarTitle}</Text>
        <TouchableOpacity style={styles.backButton} onPress={openAddModal}>
          <Text style={[styles.backIcon, { color: c.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.calendarCard, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth}><Text style={[styles.navArrow, { color: c.onSurfaceVariant }]}>‹</Text></TouchableOpacity>
            <Text style={[styles.monthTitle, { color: c.onSurface }]}>{MONTHS[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={goToNextMonth}><Text style={[styles.navArrow, { color: c.onSurfaceVariant }]}>›</Text></TouchableOpacity>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS_HEADER.map((day) => (
              <Text key={day} style={[styles.dayHeaderText, { width: cellSize, color: c.onSurfaceVariant }]}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = day === selectedDay;
              const isToday = isCurrentMonth && day === today;
              const hasSession = day ? daysWithSessions.has(day) : false;
              return (
                <TouchableOpacity key={index} style={[{ width: cellSize, height: cellSize, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }, isSelected && { backgroundColor: `${c.primary}20`, borderWidth: 1, borderColor: `${c.primary}40` }]} disabled={!day} onPress={() => day && setSelectedDay(day)}>
                  {day && (
                    <>
                      <Text style={[styles.dayText, { color: c.onSurface }, isSelected && { color: c.primary, fontWeight: '700' }, isToday && !isSelected && { color: c.primary, fontWeight: '600' }]}>{day}</Text>
                      {hasSession && <View style={[styles.dayDot, { backgroundColor: isSelected ? c.primary : c.tertiary }]} />}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Selected Day Detail */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.dayDetail, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
          <View style={styles.dayDetailHeader}>
            <Text style={[styles.dayDetailTitle, { color: c.onSurface }]}>
              {selectedDay} {MONTHS[currentMonth]}
            </Text>
            <Text style={[styles.dayDetailCount, { color: c.onSurfaceVariant }]}>
              {sessionsForSelectedDay.length + completedSessionsForDay.length} {sessionsForSelectedDay.length + completedSessionsForDay.length === 1 ? 'session' : 'sessions'}
            </Text>
          </View>

          {/* Planned Sessions */}
          {sessionsForSelectedDay.map((session) => (
            <TouchableOpacity key={session.id} onPress={() => openEditModal(session)} onLongPress={() => handleDelete(session.id)} style={[styles.plannedItem, { backgroundColor: c.surfaceContainerHigh, borderLeftColor: session.color, borderColor: c.outlineVariant + '15' }]}>
              <View style={styles.plannedItemContent}>
                <Text style={[styles.plannedTime, { color: c.primary }]}>{session.startTime} - {session.endTime}</Text>
                <Text style={[styles.plannedTitle, { color: c.onSurface }]}>{session.title}</Text>
                <View style={styles.plannedMeta}>
                  <View style={[styles.tagBadge, { backgroundColor: `${TAG_COLORS[session.tag] || c.primary}20` }]}>
                    <Text style={[styles.tagBadgeText, { color: TAG_COLORS[session.tag] || c.primary }]}>{session.tag}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(session.id)} style={styles.deleteBtn}>
                <Text style={{ color: c.error, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Completed Sessions */}
          {completedSessionsForDay.map((session) => (
            <View key={session.id} style={[styles.completedItem, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant + '15' }]}>
              <View style={[styles.completedDot, { backgroundColor: session.color || c.tertiary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.completedTitle, { color: c.onSurface }]}>{session.name || session.tag || 'Focus'}</Text>
                <Text style={[styles.completedMeta, { color: c.onSurfaceVariant }]}>{Math.round(session.duration / 60)} min · {t.completed || 'Completed'}</Text>
              </View>
              <Text style={{ color: c.tertiary, fontSize: 14 }}>✓</Text>
            </View>
          ))}

          {sessionsForSelectedDay.length === 0 && completedSessionsForDay.length === 0 && (
            <View style={styles.emptyDay}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📅</Text>
              <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>{t.noSessionsForDay || 'No sessions for this day'}</Text>
              <Text style={[styles.emptySubtext, { color: c.onSurfaceVariant }]}>{t.tapToAdd || 'Tap + to plan a session'}</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.addButton, { borderColor: c.outlineVariant, backgroundColor: `${c.primary}08` }]} onPress={openAddModal}>
            <Text style={[styles.addButtonText, { color: c.primary }]}>+ {t.planNewSession || 'Plan New Session'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Add/Edit Session Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.onSurface }]}>{editingSession ? (t.editSession || 'Edit Session') : (t.planNewSession || 'Plan New Session')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.sessionTitle || 'Title'}</Text>
            <TextInput style={[styles.input, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '30' }]} value={sessionTitle} onChangeText={setSessionTitle} placeholder={t.sessionTitlePlaceholder || 'e.g. Deep Work Block'} placeholderTextColor={c.onSurfaceVariant + '60'} />

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.startTime || 'Start'}</Text>
                <TextInput style={[styles.input, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '30' }]} value={sessionStartTime} onChangeText={setSessionStartTime} placeholder="09:00" placeholderTextColor={c.onSurfaceVariant + '60'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.endTime || 'End'}</Text>
                <TextInput style={[styles.input, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '30' }]} value={sessionEndTime} onChangeText={setSessionEndTime} placeholder="10:00" placeholderTextColor={c.onSurfaceVariant + '60'} />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.selectTag || 'Tag'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
              {TAGS.map((tag) => (
                <TouchableOpacity key={tag} onPress={() => setSessionTag(tag)} style={[styles.tagChip, { backgroundColor: sessionTag === tag ? `${TAG_COLORS[tag]}30` : c.surfaceContainer, borderColor: sessionTag === tag ? TAG_COLORS[tag] : c.outlineVariant + '30' }]}>
                  <Text style={[styles.tagChipText, { color: sessionTag === tag ? TAG_COLORS[tag] : c.onSurfaceVariant }]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>{t.selectColor || 'Color'}</Text>
            <View style={styles.colorRow}>
              {COLORS.map((color) => (
                <TouchableOpacity key={color} onPress={() => setSessionColor(color)} style={[styles.colorDot, { backgroundColor: color, borderWidth: sessionColor === color ? 3 : 0, borderColor: c.onSurface }]} />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.surfaceContainer }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>{t.cancel || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.primary }]} onPress={handleSave}>
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>{t.planIt || 'Save'}</Text>
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
  calendarCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  monthTitle: { fontSize: 20, fontWeight: '700' },
  navArrow: { fontSize: 28, paddingHorizontal: 12 },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderText: { textAlign: 'center', fontSize: 10, fontWeight: '600', letterSpacing: 1, paddingVertical: 6 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayText: { fontSize: 15, fontWeight: '500' },
  dayDot: { position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 3 },
  dayDetail: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  dayDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dayDetailTitle: { fontSize: 18, fontWeight: '700' },
  dayDetailCount: { fontSize: 13 },
  plannedItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10 },
  plannedItemContent: { flex: 1 },
  plannedTime: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  plannedTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  plannedMeta: { flexDirection: 'row', gap: 8 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  deleteBtn: { padding: 8 },
  completedItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 10, opacity: 0.8 },
  completedDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  completedTitle: { fontSize: 14, fontWeight: '600' },
  completedMeta: { fontSize: 11, marginTop: 2 },
  emptyDay: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  emptySubtext: { fontSize: 12, marginTop: 4 },
  addButton: { width: '100%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', marginTop: 4 },
  addButtonText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginTop: 14 },
  input: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1 },
  timeRow: { flexDirection: 'row', gap: 12 },
  tagScroll: { marginBottom: 4 },
  tagChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  tagChipText: { fontSize: 12, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontWeight: '700' },
});
