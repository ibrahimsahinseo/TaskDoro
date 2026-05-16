import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
  Easing, FadeIn, FadeOut,
} from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useApp, useThemeColors, useTranslation } from '../../contexts/AppContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import AmbientSoundPlayer from '../../components/AmbientSoundPlayer';
import BackgroundThemeSelector from '../../components/BackgroundThemeSelector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
const SVG_SIZE = 200;
const RADIUS = 90;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
      glowScale.value = withRepeat(withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ), -1, true);
    } else {
      glowScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const triggerModeFade = useCallback(() => {
    modeOpacity.value = withSequence(
      withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) })
    );
  }, []);

  const modeAnimStyle = useAnimatedStyle(() => ({ opacity: modeOpacity.value }));
  const glowAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  const handleSessionComplete = useCallback((completedMode: TimerMode) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date();
    dispatch({ type: 'ADD_SESSION', payload: { id: `${Date.now()}`, type: completedMode, duration: getTotalTime(completedMode), completedAt: now.toISOString(), date: now.toISOString().split('T')[0] } });

    if (completedMode === 'focus') {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      dispatch({ type: 'UPDATE_TIMER', payload: { todayPomodoros: state.timer.todayPomodoros + 1, totalCyclesCompleted: state.timer.totalCyclesCompleted + 1 } });
      dispatch({ type: 'UPDATE_PROFILE', payload: { totalFocusMinutes: state.profile.totalFocusMinutes + focusDuration } });
      triggerModeFade();
      if (newCycle >= longBreakInterval) {
        setCycleCount(0); setTimerMode('longBreak'); setTimeLeft(longBreakDuration * 60);
      } else {
        setTimerMode('shortBreak'); setTimeLeft(shortBreakDuration * 60);
      }
      if (autoStartNext) setIsRunning(true);
    } else {
      triggerModeFade(); setTimerMode('focus'); setTimeLeft(focusDuration * 60);
      if (autoStartNext) setIsRunning(true);
    }
  }, [cycleCount, longBreakInterval, focusDuration, shortBreakDuration, longBreakDuration, autoStartNext, getTotalTime, dispatch, state.timer, state.profile, triggerModeFade]);

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

  const handlePlayPause = useCallback(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsRunning((p) => !p); }, []);
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

  const currentTask = state.tasks.find((t) => !t.completed);
  const strokeDashoffset = CIRCUMFERENCE * (1 - (totalTime > 0 ? timeLeft / totalTime : 0));
  const cycleDots = Array.from({ length: longBreakInterval }, (_, i) => i);
  const sessionText = t.sessionOf.replace('{current}', String(cycleCount + 1)).replace('{total}', String(longBreakInterval));

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.brandIcon, { color: c.primary }]}>{"*"}</Text>
          <Text style={[styles.brandName, { color: c.onSurface }]}>{t.appName}</Text>
        </View>
        <Text style={[styles.headerLabel, { color: modeColor }]}>{MODE_LABELS[timerMode]}</Text>
      </View>

      <View style={styles.modeSelector}>
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => (
          <TouchableOpacity key={mode} style={[styles.modeChip, { borderColor: c.surfaceContainerHighest, backgroundColor: c.surfaceContainerLow }, timerMode === mode && { backgroundColor: `${MODE_COLORS[mode]}20`, borderColor: MODE_COLORS[mode] }]} onPress={() => handleModeSelect(mode)} activeOpacity={0.7}>
            <Text style={[styles.modeChipText, { color: c.onSurfaceVariant }, timerMode === mode && { color: MODE_COLORS[mode] }]}>
              {mode === 'focus' ? t.focus : mode === 'shortBreak' ? t.short : t.long}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.timerContainer, modeAnimStyle]}>
        <Svg width={SCREEN_WIDTH * 0.65} height={SCREEN_WIDTH * 0.65} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
          <Circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS} stroke={`${modeColor}1A`} strokeWidth={STROKE_WIDTH} fill="none" />
          <Circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS} stroke={modeColor} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" strokeDasharray={`${CIRCUMFERENCE}`} strokeDashoffset={strokeDashoffset} rotation={-90} origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`} />
        </Svg>
        <View style={styles.timerDisplayOverlay}>
          <Text style={[styles.timerText, { color: modeColor }]}>{formatTime(timeLeft)}</Text>
          <Text style={[styles.timerSubtext, { color: c.onSurfaceVariant }]}>{timerMode === 'focus' ? sessionText : t.takeABreak}</Text>
        </View>
      </Animated.View>

      <View style={styles.cycleDots}>
        {cycleDots.map((i) => (<View key={i} style={[styles.cycleDot, { backgroundColor: i < cycleCount ? modeColor : `${modeColor}33` }]} />))}
      </View>

      {currentTask && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={[styles.taskChip, { backgroundColor: c.surfaceContainerLow }]}>
          <View style={[styles.taskDot, { backgroundColor: modeColor }]} />
          <Text style={[styles.taskChipText, { color: c.onSurface }]} numberOfLines={1}>{currentTask.title}</Text>
        </Animated.View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: c.surfaceContainerHighest }]} onPress={handleReset} activeOpacity={0.7}>
          <Text style={[styles.secondaryButtonIcon, { color: c.onSurfaceVariant }]}>{"↻"}</Text>
        </TouchableOpacity>
        <Animated.View style={glowAnimStyle}>
          <TouchableOpacity style={[styles.playButton, { backgroundColor: modeColor }, isRunning && { shadowColor: modeColor, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12 }]} onPress={handlePlayPause} activeOpacity={0.8}>
            <Text style={styles.playButtonIcon}>{isRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: c.surfaceContainerHighest }]} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[styles.secondaryButtonIcon, { color: c.onSurfaceVariant }]}>{"⏭"}</Text>
        </TouchableOpacity>
      </View>

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

      <AmbientSoundPlayer visible={showAmbient} onClose={() => setShowAmbient(false)} />
      <BackgroundThemeSelector visible={showThemes} onClose={() => setShowThemes(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.safeMargin },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: Spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  brandIcon: { fontSize: 22 },
  brandName: { fontSize: 20, fontWeight: '700' },
  headerLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  modeSelector: { flexDirection: 'row', gap: Spacing.base, marginTop: Spacing.md, marginBottom: Spacing.lg },
  modeChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.base, borderRadius: BorderRadius.full, borderWidth: 1 },
  modeChipText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6 },
  timerContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  timerDisplayOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timerText: { fontFamily: 'monospace', fontSize: 56, lineHeight: 64, letterSpacing: -2, fontWeight: '700' },
  timerSubtext: { fontSize: 14, marginTop: Spacing.xs },
  cycleDots: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.md },
  cycleDot: { width: 8, height: 8, borderRadius: 4 },
  taskChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.base, borderRadius: BorderRadius.full, marginBottom: Spacing.lg, maxWidth: '80%', gap: Spacing.base },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskChipText: { fontSize: 14, flexShrink: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  playButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  playButtonIcon: { fontSize: 28, color: '#FFFFFF', marginLeft: 2 },
  secondaryButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonIcon: { fontSize: 20 },
  quickActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 'auto', marginBottom: 100, flexWrap: 'wrap', justifyContent: 'center' },
  quickActionBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.lg, borderWidth: 1, minWidth: 60 },
  quickActionIcon: { fontSize: 18, marginBottom: 4 },
  quickActionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
});
