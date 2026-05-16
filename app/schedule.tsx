import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation, ScheduleBlock } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const typeIcons: Record<string, string> = { focus: '🎯', shortBreak: '☕', longBreak: '🌊' };

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const TEMPLATES = [t.customRoutine, t.examPrep, t.codingSprint, t.deepReading];
  const WEEKDAYS = [
    { short: t.mon, num: 12 }, { short: t.tue, num: 13 }, { short: t.wed, num: 14 },
    { short: t.thu, num: 15 }, { short: t.fri, num: 16 }, { short: t.sat, num: 17 }, { short: t.sun, num: 18 },
  ];
  const typeColors: Record<string, string> = { focus: c.primary, shortBreak: c.tertiary, longBreak: c.seaBlue };
  const typeLabels: Record<string, string> = { focus: t.focusLabel, shortBreak: t.shortBreakLabel, longBreak: t.longBreakLabel };

  const dayBlocks = state.schedule.filter((b) => b.dayOfWeek === selectedDay + 1);

  const handleDeleteBlock = (id: string) => {
    dispatch({ type: 'DELETE_SCHEDULE_BLOCK', payload: id });
  };

  const handleAddBlock = () => {
    const lastBlock = dayBlocks[dayBlocks.length - 1];
    const startTime = lastBlock ? lastBlock.endTime : '09:00';
    const [hours, mins] = startTime.split(':').map(Number);
    const endMins = hours * 60 + mins + 90;
    const endTime = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
    const block: ScheduleBlock = { id: Date.now().toString(), type: 'focus', title: t.newFocusBlock, description: t.whatWillYouWork, startTime, endTime, dayOfWeek: selectedDay + 1 };
    dispatch({ type: 'ADD_SCHEDULE_BLOCK', payload: block });
  };

  const handleResetDay = () => {
    dayBlocks.forEach((b) => dispatch({ type: 'DELETE_SCHEDULE_BLOCK', payload: b.id }));
  };

  const cycleTemplate = () => {
    setSelectedTemplate((selectedTemplate + 1) % TEMPLATES.length);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant + '20' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: c.onSurface }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.scheduleEditor}</Text>
        <TouchableOpacity style={styles.saveHeaderBtn} onPress={() => Alert.alert(t.saveSchedule)}>
          <Text style={styles.saveHeaderIcon}>💾</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.pageTitle, { color: c.onSurface }]}>{t.scheduleEditor}</Text>
          <Text style={[styles.pageSubtitle, { color: c.onSurfaceVariant }]}>{t.scheduleSubtitle}</Text>
          <TouchableOpacity style={[styles.templateSelector, { backgroundColor: c.surfaceContainerHigh }]} onPress={cycleTemplate} activeOpacity={0.7}>
            <Text style={[styles.selectedTemplate, { color: c.onSurface }]}>{TEMPLATES[selectedTemplate]}</Text>
            <Text style={[styles.dropdownIcon, { color: c.onSurfaceVariant }]}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector} contentContainerStyle={styles.daySelectorContent}>
            {WEEKDAYS.map((day, index) => (
              <TouchableOpacity key={day.short} style={[styles.dayChip, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }, selectedDay === index && { backgroundColor: c.primary, borderColor: c.primary }, index >= 5 && selectedDay !== index && { opacity: 0.6 }]} onPress={() => setSelectedDay(index)}>
                <Text style={[styles.dayChipLabel, { color: c.onSurfaceVariant }, selectedDay === index && { color: c.onPrimary }]}>{day.short}</Text>
                <Text style={[styles.dayChipNum, { color: c.onSurface }, selectedDay === index && { color: c.onPrimary }]}>{day.num}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.timelineCard, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
          <View style={styles.timelineLines}>
            {[0, 1, 2, 3].map((i) => (<View key={i} style={[styles.timelineLine, { backgroundColor: c.onSurface }]} />))}
          </View>

          {dayBlocks.map((block, index) => (
            <Animated.View key={block.id} entering={FadeInRight.delay(index * 100).springify()} style={[styles.blockCard, { borderColor: c.outlineVariant + '20' }, block.type === 'focus' ? { backgroundColor: c.cardBg } : { backgroundColor: c.surfaceContainerHigh, borderLeftWidth: 4, borderLeftColor: typeColors[block.type] }]}>
              <View style={styles.dragHandle}><Text style={[styles.dragIcon, { color: `${c.onSurfaceVariant}40` }]}>⋮⋮</Text></View>
              <View style={styles.blockContent}>
                <View style={styles.blockHeader}>
                  <View style={[styles.blockTypeBadge, { backgroundColor: `${typeColors[block.type]}15` }]}>
                    <Text style={[styles.blockTypeText, { color: typeColors[block.type] }]}>{typeIcons[block.type]} {typeLabels[block.type]}</Text>
                  </View>
                  <Text style={[styles.blockTime, { color: c.onSurfaceVariant }]}>{block.startTime} - {block.endTime}</Text>
                </View>
                {block.type === 'focus' && (
                  <>
                    <Text style={[styles.blockTitle, { color: c.onSurface }]}>{block.title}</Text>
                    {block.description ? <Text style={[styles.blockDescription, { color: c.onSurfaceVariant }]}>{block.description}</Text> : null}
                  </>
                )}
              </View>
              <TouchableOpacity style={styles.deleteBlockBtn} onPress={() => handleDeleteBlock(block.id)}>
                <Text style={[styles.deleteBlockIcon, { color: c.onSurfaceVariant }]}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity style={[styles.addBlockButton, { borderColor: c.outlineVariant }]} onPress={handleAddBlock}>
            <Text style={[styles.addBlockIcon, { color: c.onSurfaceVariant }]}>⊕</Text>
            <Text style={[styles.addBlockText, { color: c.onSurfaceVariant }]}>{t.addBlock}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionRow}>
          <TouchableOpacity style={[styles.resetButton, { borderColor: c.outlineVariant }]} onPress={handleResetDay}>
            <Text style={[styles.resetButtonText, { color: c.onSurface }]}>{t.resetDay}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: c.primary }]} onPress={() => Alert.alert(t.saveSchedule)}>
            <Text style={[styles.saveButtonText, { color: c.onPrimary }]}>{t.saveSchedule}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.safeMargin, height: 56, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  saveHeaderBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveHeaderIcon: { fontSize: 20 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.safeMargin, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  pageSubtitle: { fontSize: 15, marginBottom: Spacing.md },
  templateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.xl, paddingHorizontal: 16, paddingVertical: 14, marginBottom: Spacing.md },
  selectedTemplate: { fontSize: 15, fontWeight: '500' },
  dropdownIcon: { fontSize: 12 },
  daySelector: { marginBottom: Spacing.md },
  daySelectorContent: { gap: 8, paddingRight: 20 },
  dayChip: { alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.xl, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 1 },
  dayChipLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  dayChipNum: { fontSize: 22, fontWeight: '700' },
  timelineCard: { borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1, marginBottom: Spacing.md },
  timelineLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 16, opacity: 0.1 },
  timelineLine: { height: 1 },
  blockCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1, marginBottom: 10, gap: 12 },
  dragHandle: { justifyContent: 'center' },
  dragIcon: { fontSize: 16, letterSpacing: -2 },
  blockContent: { flex: 1 },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  blockTypeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  blockTypeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  blockTime: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  blockTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  blockDescription: { fontSize: 14 },
  deleteBlockBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deleteBlockIcon: { fontSize: 16 },
  addBlockButton: { width: '100%', paddingVertical: 18, borderRadius: BorderRadius.xl, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, marginTop: 4 },
  addBlockIcon: { fontSize: 22 },
  addBlockText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  resetButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.full, borderWidth: 1 },
  resetButtonText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  saveButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.full },
  saveButtonText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
