import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useApp, ScheduleBlock } from '../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const TEMPLATES = ['Custom Routine', 'Exam Prep Template', 'Coding Sprint', 'Deep Reading'];

const WEEKDAYS = [
  { short: 'Mon', num: 12 },
  { short: 'Tue', num: 13 },
  { short: 'Wed', num: 14 },
  { short: 'Thu', num: 15 },
  { short: 'Fri', num: 16 },
  { short: 'Sat', num: 17 },
  { short: 'Sun', num: 18 },
];

const typeColors: Record<string, string> = {
  focus: Colors.primary,
  shortBreak: Colors.tertiary,
  longBreak: Colors.seaBlue,
};

const typeLabels: Record<string, string> = {
  focus: 'FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak: 'LONG BREAK',
};

const typeIcons: Record<string, string> = {
  focus: '🎯',
  shortBreak: '☕',
  longBreak: '🌊',
};

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const dayBlocks = state.schedule.filter((b) => b.dayOfWeek === selectedDay + 1);

  const handleDeleteBlock = (id: string) => {
    dispatch({ type: 'DELETE_SCHEDULE_BLOCK', payload: id });
  };

  const handleAddBlock = () => {
    const lastBlock = dayBlocks[dayBlocks.length - 1];
    const startTime = lastBlock ? lastBlock.endTime : '09:00';
    const [hours, mins] = startTime.split(':').map(Number);
    const endMins = hours * 60 + mins + 90;
    const endTime = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(
      endMins % 60
    ).padStart(2, '0')}`;

    const block: ScheduleBlock = {
      id: Date.now().toString(),
      type: 'focus',
      title: 'New Focus Block',
      description: 'What will you work on?',
      startTime,
      endTime,
      dayOfWeek: selectedDay + 1,
    };
    dispatch({ type: 'ADD_SCHEDULE_BLOCK', payload: block });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Editor</Text>
        <TouchableOpacity style={styles.saveHeaderBtn}>
          <Text style={styles.saveHeaderIcon}>💾</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Template Selector */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.pageTitle}>Schedule Editor</Text>
          <Text style={styles.pageSubtitle}>Plan your deep work sessions and breaks.</Text>

          <View style={styles.templateSelector}>
            <Text style={styles.selectedTemplate}>{TEMPLATES[selectedTemplate]}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </Animated.View>

        {/* Weekly Day Selector */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.daySelector}
            contentContainerStyle={styles.daySelectorContent}
          >
            {WEEKDAYS.map((day, index) => (
              <TouchableOpacity
                key={day.short}
                style={[
                  styles.dayChip,
                  selectedDay === index && styles.dayChipActive,
                  index >= 5 && selectedDay !== index && { opacity: 0.6 },
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text
                  style={[
                    styles.dayChipLabel,
                    selectedDay === index && styles.dayChipLabelActive,
                  ]}
                >
                  {day.short.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.dayChipNum,
                    selectedDay === index && styles.dayChipNumActive,
                  ]}
                >
                  {day.num}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Timeline Grid */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.timelineCard}>
          {/* Background lines */}
          <View style={styles.timelineLines}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.timelineLine} />
            ))}
          </View>

          {dayBlocks.map((block, index) => (
            <Animated.View
              key={block.id}
              entering={FadeInRight.delay(index * 100).springify()}
              style={[
                styles.blockCard,
                block.type === 'focus'
                  ? styles.focusBlock
                  : block.type === 'shortBreak'
                  ? styles.breakBlock
                  : styles.longBreakBlock,
              ]}
            >
              <View style={styles.dragHandle}>
                <Text style={styles.dragIcon}>⋮⋮</Text>
              </View>

              <View style={styles.blockContent}>
                <View style={styles.blockHeader}>
                  <View
                    style={[
                      styles.blockTypeBadge,
                      { backgroundColor: `${typeColors[block.type]}15` },
                    ]}
                  >
                    <Text style={[styles.blockTypeText, { color: typeColors[block.type] }]}>
                      {typeIcons[block.type]} {typeLabels[block.type]}
                    </Text>
                  </View>
                  <Text style={styles.blockTime}>
                    {block.startTime} - {block.endTime}
                  </Text>
                </View>

                {block.type === 'focus' && (
                  <>
                    <Text style={styles.blockTitle}>{block.title}</Text>
                    {block.description ? (
                      <Text style={styles.blockDescription}>{block.description}</Text>
                    ) : null}
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteBlockBtn}
                onPress={() => handleDeleteBlock(block.id)}
              >
                <Text style={styles.deleteBlockIcon}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Add Block Button */}
          <TouchableOpacity style={styles.addBlockButton} onPress={handleAddBlock}>
            <Text style={styles.addBlockIcon}>⊕</Text>
            <Text style={styles.addBlockText}>ADD BLOCK</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionRow}>
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>RESET DAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SAVE SCHEDULE</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  saveHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.safeMargin,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  templateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: Spacing.md,
  },
  selectedTemplate: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  dropdownIcon: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  daySelector: {
    marginBottom: Spacing.md,
  },
  daySelectorContent: {
    gap: 8,
    paddingRight: 20,
  },
  dayChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayChipLabelActive: {
    color: Colors.onPrimary,
  },
  dayChipNum: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  dayChipNumActive: {
    color: Colors.onPrimary,
  },
  timelineCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  timelineLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 16,
    opacity: 0.1,
  },
  timelineLine: {
    height: 1,
    backgroundColor: Colors.onSurface,
  },
  blockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
    gap: 12,
  },
  focusBlock: {
    backgroundColor: Colors.cardBg,
  },
  breakBlock: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderLeftWidth: 4,
    borderLeftColor: Colors.tertiary,
  },
  longBreakBlock: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderLeftWidth: 4,
    borderLeftColor: Colors.seaBlue,
  },
  dragHandle: {
    justifyContent: 'center',
  },
  dragIcon: {
    fontSize: 16,
    color: `${Colors.onSurfaceVariant}40`,
    letterSpacing: -2,
  },
  blockContent: {
    flex: 1,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  blockTypeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  blockTime: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  blockDescription: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  deleteBlockBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBlockIcon: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  addBlockButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
    marginTop: 4,
  },
  addBlockIcon: {
    fontSize: 22,
    color: Colors.onSurfaceVariant,
  },
  addBlockText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onSurface,
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onPrimary,
  },
});
