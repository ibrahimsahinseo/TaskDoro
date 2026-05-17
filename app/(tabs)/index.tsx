import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing, FadeIn, FadeOut, FadeInDown } from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useApp, useThemeColors, useTranslation, xpForNextLevel } from '../../contexts/AppContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});
import { Spacing, BorderRadius } from '../../constants/theme';
import AmbientSoundPlayer from '../../components/AmbientSoundPlayer';
import BackgroundThemeSelector from '../../components/BackgroundThemeSelector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
const SVG_SIZE = 200;
const RADIUS = 90;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SESSION_TAGS = [
  { id: 'work', icon: '💼' },
  { id: 'study', icon: '📚' },
  { id: 'coding', icon: '💻' },
  { id: 'reading', icon: '📖' },
  { id: 'design', icon: '🎨' },
  { id: 'writing', icon: '✍️' },
  { id: 'meeting', icon: '🤝' },
  { id: 'exercise', icon: '💪' },
  { id: 'creative', icon: '🎯' },
  { id: 'other', icon: '📌' },
];

const SESSION_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();

  const { focusDuration, shortBreakDuration, longBreakDuration, longBreakInterval, autoStartNext } = state.settings;
  const MODE_COLORS: Record<TimerMode, string> = { focus: c.coral, shortBreak: c.mint, longBreak: c.seaBlue };
  const MODE_LABELS: Record<TimerMode, string> = { focus: t.focusTime, shortBreak: t.shortBreak, longBreak: t.longBreak };

  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const [showAmbient, setShowAmbient] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  // Session save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalType, setSaveModalType] = useState<'complete' | 'paused'>('complete');
  const [sessionName, setSessionName] = useState('');
  const [sessionTag, setSessionTag] = useState('work');
  const [sessionColor, setSessionColor] = useState(SESSION_COLORS[0]);
  const [elapsedOnPause, setElapsedOnPause] = useState(0);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useSharedValue(1);
  const glowScale = useSharedValue(1);
  const modeOpacity = useSharedValue(1);

  const getTotalTime = useCallback((mode: TimerMode): number => {
    switch (mode) {
      case 'focus': return focusDuration * 60;
      case 'shortBreak': return shortBreakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration]);

  const totalTime = getTotalTime(timerMode);
  const modeColor = MODE_COLORS[timerMode];

  useEffect(() => {
    progressAnim.value = withTiming(totalTime > 0 ? timeLeft / totalTime : 0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [timeLeft, totalTime]);

  useEffect(() => {
    if (isRunning) {
      glowScale.value = withRepeat(withSequence(withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })), -1, true);
    } else {
      glowScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const triggerModeFade = useCallback(() => {
    modeOpacity.value = withSequence(withTiming(0, { duration: 200 }), withTiming(1, { duration: 300 }));
  }, []);

  const modeAnimStyle = useAnimatedStyle(() => ({ opacity: modeOpacity.value }));
  const glowAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  const getTagLabel = (tagId: string) => {
    const map: Record<string, string> = { work: t.tagWork, study: t.tagStudy, coding: t.tagCoding, reading: t.tagReading, design: t.tagDesign, writing: t.tagWriting, meeting: t.tagMeeting, exercise: t.tagExercise, creative: t.tagCreative, other: t.tagOther };
    return map[tagId] || tagId;
  };

  const saveCurrentSession = useCallback((elapsed: number) => {
    const focusMinutes = Math.round(elapsed / 60);
    if (focusMinutes < 1) return;
    const now = new Date();
    const xp = focusMinutes * 2;
    dispatch({ type: 'ADD_SESSION', payload: { id: `${Date.now()}`, type: timerMode, duration: elapsed, completedAt: now.toISOString(), date: now.toISOString().split('T')[0], name: sessionName.trim() || undefined, tag: sessionTag, color: sessionColor } });
    if (timerMode === 'focus') {
      dispatch({ type: 'UPDATE_TIMER', payload: { todayPomodoros: state.timer.todayPomodoros + 1, totalCyclesCompleted: state.timer.totalCyclesCompleted + 1, todayFocusMinutes: state.timer.todayFocusMinutes + focusMinutes } });
      dispatch({ type: 'UPDATE_PROFILE', payload: { totalFocusMinutes: state.profile.totalFocusMinutes + focusMinutes, totalSessions: state.profile.totalSessions + 1 } });
      dispatch({ type: 'ADD_XP', payload: xp });
    }
    setEarnedXp(xp);
    setShowSaveModal(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
    // Check achievements
    checkAchievements(focusMinutes);
  }, [timerMode, sessionName, sessionTag, sessionColor, state, dispatch]);

  const checkAchievements = (addedMinutes: number) => {
    const p = state.profile;
    const newTotal = p.totalSessions + 1;
    const todayMin = state.timer.todayFocusMinutes + addedMinutes;
    if (newTotal >= 1) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first_session' });
    if (newTotal >= 10) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'ten_sessions' });
    if (newTotal >= 50) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'fifty_sessions' });
    if (newTotal >= 100) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'hundred_sessions' });
    if (todayMin >= 60) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'one_hour' });
    if (todayMin >= 300) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'five_hours' });
    if (p.currentStreak >= 7) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'week_streak' });
    if (p.currentStreak >= 30) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'month_streak' });
    if (state.timer.todayPomodoros + 1 >= state.timer.dailyTarget) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'perfect_day' });
    const hour = new Date().getHours();
    if (hour < 7) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'early_bird' });
    if (hour >= 23) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'night_owl' });
    if (p.totalTasksCompleted >= 20) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'task_master' });
    if (calculateLevel(p.xp + addedMinutes * 2) >= 10) dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'level_10' });
  };

  const handleSessionComplete = useCallback((completedMode: TimerMode) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Notifications.scheduleNotificationAsync({
      content: {
        title: completedMode === 'focus' ? '🎯 ' + t.sessionComplete : '☕ ' + t.takeABreak,
        body: completedMode === 'focus' ? t.greatWork : t.focusTime,
        sound: state.settings.soundEnabled ? 'default' : undefined,
      },
      trigger: null,
    }).catch(() => {});
    if (completedMode === 'focus') {
      setElapsedOnPause(getTotalTime(completedMode));
      setSaveModalType('complete');
      setSessionName('');
      setShowSaveModal(true);
    } else {
      const now = new Date();
      dispatch({ type: 'ADD_SESSION', payload: { id: `${Date.now()}`, type: completedMode, duration: getTotalTime(completedMode), completedAt: now.toISOString(), date: now.toISOString().split('T')[0] } });
      triggerModeFade();
      setTimerMode('focus');
      setTimeLeft(focusDuration * 60);
      if (autoStartNext) setIsRunning(true);
    }
  }, [focusDuration, autoStartNext, getTotalTime, dispatch, triggerModeFade]);

  const handleSaveAndAdvance = () => {
    saveCurrentSession(elapsedOnPause);
    const newCycle = cycleCount + 1;
    setCycleCount(newCycle);
    triggerModeFade();
    if (newCycle >= longBreakInterval) {
      setCycleCount(0); setTimerMode('longBreak'); setTimeLeft(longBreakDuration * 60);
    } else {
      setTimerMode('shortBreak'); setTimeLeft(shortBreakDuration * 60);
    }
    if (autoStartNext) setIsRunning(true);
  };

  const handleDiscardAndAdvance = () => {
    setShowSaveModal(false);
    const newCycle = cycleCount + 1;
    setCycleCount(newCycle);
    triggerModeFade();
    if (newCycle >= longBreakInterval) {
      setCycleCount(0); setTimerMode('longBreak'); setTimeLeft(longBreakDuration * 60);
    } else {
      setTimerMode('shortBreak'); setTimeLeft(shortBreakDuration * 60);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { setIsRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); setTimeout(() => handleSessionComplete(timerMode), 0); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [isRunning, timerMode, handleSessionComplete]);

  const handlePlayPause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRunning && timerMode === 'focus') {
      setIsRunning(false);
      const elapsed = getTotalTime(timerMode) - timeLeft;
      if (elapsed > 30) {
        setElapsedOnPause(elapsed);
        setSaveModalType('paused');
        setSessionName('');
        setShowSaveModal(true);
        return;
      }
    }
    setIsRunning((p) => !p);
  }, [isRunning, timerMode, timeLeft, getTotalTime]);

  const handleReset = useCallback(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsRunning(false); setTimeLeft(getTotalTime(timerMode)); }, [timerMode, getTotalTime]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsRunning(false);
    if (timerMode === 'focus') {
      const nc = cycleCount + 1; setCycleCount(nc); triggerModeFade();
      if (nc >= longBreakInterval) { setCycleCount(0); setTimerMode('longBreak'); setTimeLeft(longBreakDuration * 60); }
      else { setTimerMode('shortBreak'); setTimeLeft(shortBreakDuration * 60); }
    } else { triggerModeFade(); setTimerMode('focus'); setTimeLeft(focusDuration * 60); }
  }, [timerMode, cycleCount, longBreakInterval, focusDuration, shortBreakDuration, longBreakDuration, triggerModeFade]);

  const handleModeSelect = useCallback((mode: TimerMode) => {
    if (mode === timerMode) return;
    Haptics.selectionAsync(); setIsRunning(false); triggerModeFade(); setTimerMode(mode); setTimeLeft(getTotalTime(mode));
  }, [timerMode, getTotalTime, triggerModeFade]);

  const handleContinueFromModal = () => {
    setShowSaveModal(false);
    setIsRunning(true);
  };

  const currentTask = state.tasks.find((t) => !t.completed);
  const strokeDashoffset = CIRCUMFERENCE * (1 - (totalTime > 0 ? timeLeft / totalTime : 0));
  const cycleDots = Array.from({ length: longBreakInterval }, (_, i) => i);
  const sessionText = t.sessionOf.replace('{current}', String(cycleCount + 1)).replace('{total}', String(longBreakInterval));

  // Daily progress
  const dailyProgress = state.timer.todayPomodoros / state.timer.dailyTarget;
  const xpCurrent = state.profile.xp;
  const xpNext = xpForNextLevel(state.profile.level);
  const xpPrev = (state.profile.level - 1) * (state.profile.level - 1) * 50;
  const xpProgress = xpNext > xpPrev ? (xpCurrent - xpPrev) / (xpNext - xpPrev) : 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      {/* Header with app name */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.brandIcon, { color: c.primary }]}>⏱</Text>
          <Text style={[styles.brandName, { color: c.onSurface }]}>{t.appName}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.xpBadge, { backgroundColor: `${c.tertiary}20` }]}>
            <Text style={[styles.xpText, { color: c.tertiary }]}>Lv.{state.profile.level}</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: `${c.coral}20` }]}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={[styles.streakText, { color: c.coral }]}>{state.profile.currentStreak}</Text>
          </View>
        </View>
      </View>

      {/* Daily progress bar */}
      <View style={styles.dailyProgressRow}>
        <Text style={[styles.dailyLabel, { color: c.onSurfaceVariant }]}>{t.dailyGoal}: {state.timer.todayPomodoros}/{state.timer.dailyTarget}</Text>
        <View style={[styles.dailyBar, { backgroundColor: c.surfaceContainerHighest }]}>
          <View style={[styles.dailyBarFill, { width: `${Math.min(dailyProgress * 100, 100)}%`, backgroundColor: dailyProgress >= 1 ? c.mint : c.primary }]} />
        </View>
      </View>

      {/* Mode selector */}
      <View style={styles.modeSelector}>
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => (
          <TouchableOpacity key={mode} style={[styles.modeChip, { borderColor: c.surfaceContainerHighest, backgroundColor: c.surfaceContainerLow }, timerMode === mode && { backgroundColor: `${MODE_COLORS[mode]}20`, borderColor: MODE_COLORS[mode] }]} onPress={() => handleModeSelect(mode)} activeOpacity={0.7}>
            <Text style={[styles.modeChipText, { color: c.onSurfaceVariant }, timerMode === mode && { color: MODE_COLORS[mode] }]}>
              {mode === 'focus' ? t.focus : mode === 'shortBreak' ? t.short : t.long}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer */}
      <Animated.View style={[styles.timerContainer, modeAnimStyle]}>
        <Svg width={SCREEN_WIDTH * 0.6} height={SCREEN_WIDTH * 0.6} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
          <Circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS} stroke={`${modeColor}1A`} strokeWidth={STROKE_WIDTH} fill="none" />
          <Circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS} stroke={modeColor} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" strokeDasharray={`${CIRCUMFERENCE}`} strokeDashoffset={strokeDashoffset} rotation={-90} origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`} />
        </Svg>
        <View style={styles.timerDisplayOverlay}>
          <Text style={[styles.timerText, { color: modeColor }]}>{formatTime(timeLeft)}</Text>
          <Text style={[styles.timerSubtext, { color: c.onSurfaceVariant }]}>{timerMode === 'focus' ? sessionText : t.takeABreak}</Text>
        </View>
      </Animated.View>

      {/* Cycle dots */}
      <View style={styles.cycleDots}>
        {cycleDots.map((i) => (<View key={i} style={[styles.cycleDot, { backgroundColor: i < cycleCount ? modeColor : `${modeColor}33` }]} />))}
      </View>

      {/* Current task */}
      {currentTask && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={[styles.taskChip, { backgroundColor: c.surfaceContainerLow }]}>
          <View style={[styles.taskDot, { backgroundColor: modeColor }]} />
          <Text style={[styles.taskChipText, { color: c.onSurface }]} numberOfLines={1}>{currentTask.title}</Text>
        </Animated.View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: c.surfaceContainerHighest }]} onPress={handleReset} activeOpacity={0.7}>
          <Text style={[styles.secondaryButtonIcon, { color: c.onSurfaceVariant }]}>↻</Text>
        </TouchableOpacity>
        <Animated.View style={glowAnimStyle}>
          <TouchableOpacity style={[styles.playButton, { backgroundColor: modeColor }, isRunning && { shadowColor: modeColor, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12 }]} onPress={handlePlayPause} activeOpacity={0.8}>
            <Text style={styles.playButtonIcon}>{isRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: c.surfaceContainerHighest }]} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[styles.secondaryButtonIcon, { color: c.onSurfaceVariant }]}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        {[
          { icon: '🎵', label: t.sounds, action: () => setShowAmbient(true) },
          { icon: '🎨', label: t.theme, action: () => setShowThemes(true) },
          { icon: '🎯', label: t.goals, action: () => router.push('/goals') },
          { icon: '👤', label: t.profile, action: () => router.push('/profile') },
          { icon: '📅', label: t.calendar, action: () => router.push('/calendar') },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={[styles.quickActionBtn, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]} onPress={item.action} activeOpacity={0.7}>
            <Text style={styles.quickActionIcon}>{item.icon}</Text>
            <Text style={[styles.quickActionLabel, { color: c.onSurfaceVariant }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Saved toast */}
      {showSavedToast && (
        <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(300)} style={[styles.savedToast, { backgroundColor: c.mint }]}>
          <Text style={styles.savedToastText}>✓ {t.saved} {t.xpEarned.replace('{xp}', String(earnedXp))}</Text>
        </Animated.View>
      )}

      {/* Session Save Modal */}
      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surfaceContainerLow }]}>
            <View style={[styles.modalHandle, { backgroundColor: c.outlineVariant }]} />
            <Text style={[styles.modalEmoji, { color: c.primary }]}>{saveModalType === 'complete' ? '🎉' : '⏸️'}</Text>
            <Text style={[styles.modalTitle, { color: c.onSurface }]}>{saveModalType === 'complete' ? t.sessionComplete : t.sessionPaused}</Text>
            <Text style={[styles.modalSubtitle, { color: c.onSurfaceVariant }]}>{saveModalType === 'complete' ? t.greatWork : t.pausedDesc}</Text>
            <Text style={[styles.modalDuration, { color: c.primary }]}>{t.minutesFocused.replace('{min}', String(Math.round(elapsedOnPause / 60)))}</Text>

            <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '40' }]} placeholder={t.sessionNamePlaceholder} placeholderTextColor={c.outline} value={sessionName} onChangeText={setSessionName} />

            <Text style={[styles.modalSectionLabel, { color: c.onSurfaceVariant }]}>{t.selectTag}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll} contentContainerStyle={styles.tagScrollContent}>
              {SESSION_TAGS.map((tag) => (
                <TouchableOpacity key={tag.id} style={[styles.tagChip, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '30' }, sessionTag === tag.id && { backgroundColor: `${c.primary}20`, borderColor: c.primary }]} onPress={() => setSessionTag(tag.id)}>
                  <Text style={styles.tagIcon}>{tag.icon}</Text>
                  <Text style={[styles.tagLabel, { color: c.onSurfaceVariant }, sessionTag === tag.id && { color: c.primary }]}>{getTagLabel(tag.id)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.modalSectionLabel, { color: c.onSurfaceVariant }]}>{t.selectColor}</Text>
            <View style={styles.colorRow}>
              {SESSION_COLORS.map((color) => (
                <TouchableOpacity key={color} style={[styles.colorDot, { backgroundColor: color }, sessionColor === color && styles.colorDotSelected]} onPress={() => setSessionColor(color)} />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.primary }]} onPress={handleSaveAndAdvance}>
                <Text style={[styles.modalBtnText, { color: c.onPrimary }]}>{t.saveSession}</Text>
              </TouchableOpacity>
              {saveModalType === 'paused' && (
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.surfaceContainerHigh }]} onPress={handleContinueFromModal}>
                  <Text style={[styles.modalBtnText, { color: c.onSurface }]}>{t.continueSession}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.modalBtnOutline, { borderColor: c.outlineVariant }]} onPress={handleDiscardAndAdvance}>
                <Text style={[styles.modalBtnOutlineText, { color: c.onSurfaceVariant }]}>{t.discardSession}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AmbientSoundPlayer visible={showAmbient} onClose={() => setShowAmbient(false)} />
      <BackgroundThemeSelector visible={showThemes} onClose={() => setShowThemes(false)} />
    </View>
  );
}

function calculateLevel(xp: number): number { return Math.floor(Math.sqrt(xp / 50)) + 1; }

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.safeMargin },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: Spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  brandIcon: { fontSize: 22 },
  brandName: { fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  xpText: { fontSize: 12, fontWeight: '700' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, gap: 4 },
  streakIcon: { fontSize: 14 },
  streakText: { fontSize: 12, fontWeight: '700' },
  dailyProgressRow: { width: '100%', marginBottom: Spacing.sm },
  dailyLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  dailyBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  dailyBarFill: { height: '100%', borderRadius: 3 },
  modeSelector: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.md },
  modeChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.base, borderRadius: BorderRadius.full, borderWidth: 1 },
  modeChipText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6 },
  timerContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  timerDisplayOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timerText: { fontFamily: 'monospace', fontSize: 52, lineHeight: 60, letterSpacing: -2, fontWeight: '700' },
  timerSubtext: { fontSize: 13, marginTop: Spacing.xs },
  cycleDots: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.sm },
  cycleDot: { width: 8, height: 8, borderRadius: 4 },
  taskChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.base, borderRadius: BorderRadius.full, marginBottom: Spacing.md, maxWidth: '80%', gap: Spacing.base },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskChipText: { fontSize: 14, flexShrink: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },
  playButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  playButtonIcon: { fontSize: 28, color: '#FFFFFF', marginLeft: 2 },
  secondaryButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonIcon: { fontSize: 20 },
  quickActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 'auto', marginBottom: 100, flexWrap: 'wrap', justifyContent: 'center' },
  quickActionBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.lg, borderWidth: 1, minWidth: 60 },
  quickActionIcon: { fontSize: 18, marginBottom: 4 },
  quickActionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  savedToast: { position: 'absolute', bottom: 120, paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.full },
  savedToastText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.md, paddingBottom: 40, alignItems: 'center' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, marginBottom: 16 },
  modalEmoji: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  modalDuration: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  modalInput: { width: '100%', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, marginBottom: 16 },
  modalSectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 8 },
  tagScroll: { maxHeight: 44, marginBottom: 16 },
  tagScrollContent: { gap: 8, paddingRight: 20 },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, gap: 6 },
  tagIcon: { fontSize: 14 },
  tagLabel: { fontSize: 12, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  modalActions: { width: '100%', gap: 10 },
  modalBtn: { width: '100%', paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  modalBtnOutline: { width: '100%', paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center', borderWidth: 1 },
  modalBtnOutlineText: { fontSize: 14, fontWeight: '600' },
});
