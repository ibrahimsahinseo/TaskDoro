import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import AmbientSoundPlayer from '../../components/AmbientSoundPlayer';
import BackgroundThemeSelector from '../../components/BackgroundThemeSelector';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_COLORS: Record<TimerMode, string> = {
  focus: Colors.coral,
  shortBreak: Colors.mint,
  longBreak: Colors.seaBlue,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

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
  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    autoStartNext,
  } = state.settings;

  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const [showAmbient, setShowAmbient] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  // Animated values
  const progressAnim = useSharedValue(1);
  const glowScale = useSharedValue(1);
  const modeOpacity = useSharedValue(1);

  // Derive total time for the current mode
  const getTotalTime = useCallback(
    (mode: TimerMode): number => {
      switch (mode) {
        case 'focus':
          return focusDuration * 60;
        case 'shortBreak':
          return shortBreakDuration * 60;
        case 'longBreak':
          return longBreakDuration * 60;
      }
    },
    [focusDuration, shortBreakDuration, longBreakDuration]
  );

  const totalTime = getTotalTime(timerMode);
  const modeColor = MODE_COLORS[timerMode];

  // Update progress ring animation
  useEffect(() => {
    const fraction = totalTime > 0 ? timeLeft / totalTime : 0;
    progressAnim.value = withTiming(fraction, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [timeLeft, totalTime, progressAnim]);

  // Glow pulse when running
  useEffect(() => {
    if (isRunning) {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glowScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning, glowScale]);

  // Mode transition fade
  const triggerModeFade = useCallback(() => {
    modeOpacity.value = withSequence(
      withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) })
    );
  }, [modeOpacity]);

  const modeAnimStyle = useAnimatedStyle(() => ({
    opacity: modeOpacity.value,
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  // Handle session completion
  const handleSessionComplete = useCallback(
    (completedMode: TimerMode) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Record session
      const now = new Date();
      dispatch({
        type: 'ADD_SESSION',
        payload: {
          id: `${Date.now()}`,
          type: completedMode,
          duration: getTotalTime(completedMode),
          completedAt: now.toISOString(),
          date: now.toISOString().split('T')[0],
        },
      });

      if (completedMode === 'focus') {
        const newCycleCount = cycleCount + 1;
        setCycleCount(newCycleCount);

        // Update timer stats
        dispatch({
          type: 'UPDATE_TIMER',
          payload: {
            todayPomodoros: state.timer.todayPomodoros + 1,
            totalCyclesCompleted: state.timer.totalCyclesCompleted + 1,
          },
        });

        // Update profile focus minutes
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            totalFocusMinutes: state.profile.totalFocusMinutes + focusDuration,
          },
        });

        triggerModeFade();

        if (newCycleCount >= longBreakInterval) {
          setCycleCount(0);
          setTimerMode('longBreak');
          setTimeLeft(longBreakDuration * 60);
          if (autoStartNext) {
            sessionStartRef.current = Date.now();
            setIsRunning(true);
          }
        } else {
          setTimerMode('shortBreak');
          setTimeLeft(shortBreakDuration * 60);
          if (autoStartNext) {
            sessionStartRef.current = Date.now();
            setIsRunning(true);
          }
        }
      } else {
        // Break completed, switch to focus
        triggerModeFade();
        setTimerMode('focus');
        setTimeLeft(focusDuration * 60);
        if (autoStartNext) {
          sessionStartRef.current = Date.now();
          setIsRunning(true);
        }
      }
    },
    [
      cycleCount,
      longBreakInterval,
      focusDuration,
      shortBreakDuration,
      longBreakDuration,
      autoStartNext,
      getTotalTime,
      dispatch,
      state.timer.todayPomodoros,
      state.timer.totalCyclesCompleted,
      state.profile.totalFocusMinutes,
      triggerModeFade,
    ]
  );

  // Countdown interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Use timeout to avoid state updates during render
            setTimeout(() => handleSessionComplete(timerMode), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timerMode, handleSessionComplete]);

  // Handlers
  const handlePlayPause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isRunning) {
      sessionStartRef.current = Date.now();
    }
    setIsRunning((prev) => !prev);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setTimeLeft(getTotalTime(timerMode));
  }, [timerMode, getTotalTime]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(false);
    if (timerMode === 'focus') {
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);
      triggerModeFade();
      if (newCycleCount >= longBreakInterval) {
        setCycleCount(0);
        setTimerMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setTimerMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      triggerModeFade();
      setTimerMode('focus');
      setTimeLeft(focusDuration * 60);
    }
  }, [
    timerMode,
    cycleCount,
    longBreakInterval,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    triggerModeFade,
  ]);

  const handleModeSelect = useCallback(
    (mode: TimerMode) => {
      if (mode === timerMode) return;
      Haptics.selectionAsync();
      setIsRunning(false);
      triggerModeFade();
      setTimerMode(mode);
      setTimeLeft(getTotalTime(mode));
    },
    [timerMode, getTotalTime, triggerModeFade]
  );

  // Get current task
  const currentTask = state.tasks.find((t) => !t.completed);

  // SVG progress calculations
  const strokeDashoffset = CIRCUMFERENCE * (1 - (totalTime > 0 ? timeLeft / totalTime : 0));

  // Cycle dots
  const cycleDots = Array.from({ length: longBreakInterval }, (_, i) => i);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandIcon}>{"*"}</Text>
          <Text style={styles.brandName}>TaskDoro</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.headerLabel, { color: modeColor }]}>
            {MODE_LABELS[timerMode]}
          </Text>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeChip,
              timerMode === mode && {
                backgroundColor: `${MODE_COLORS[mode]}20`,
                borderColor: MODE_COLORS[mode],
              },
            ]}
            onPress={() => handleModeSelect(mode)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeChipText,
                timerMode === mode && { color: MODE_COLORS[mode] },
              ]}
            >
              {mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short' : 'Long'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Ring */}
      <Animated.View style={[styles.timerContainer, modeAnimStyle]}>
        <Svg
          width={SCREEN_WIDTH * 0.65}
          height={SCREEN_WIDTH * 0.65}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        >
          {/* Background circle */}
          <Circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={RADIUS}
            stroke={`${modeColor}1A`}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={RADIUS}
            stroke={modeColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            rotation={-90}
            origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`}
          />
        </Svg>

        {/* Timer Display overlay */}
        <View style={styles.timerDisplayOverlay}>
          <Text style={[styles.timerText, { color: modeColor }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerSubtext}>
            {timerMode === 'focus'
              ? `Session ${cycleCount + 1} of ${longBreakInterval}`
              : 'Take a break'}
          </Text>
        </View>
      </Animated.View>

      {/* Cycle Dots */}
      <View style={styles.cycleDots}>
        {cycleDots.map((i) => (
          <View
            key={i}
            style={[
              styles.cycleDot,
              {
                backgroundColor:
                  i < cycleCount ? modeColor : `${modeColor}33`,
              },
            ]}
          />
        ))}
      </View>

      {/* Current Task Chip */}
      {currentTask && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.taskChip}
        >
          <View style={[styles.taskDot, { backgroundColor: modeColor }]} />
          <Text style={styles.taskChipText} numberOfLines={1}>
            {currentTask.title}
          </Text>
        </Animated.View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Reset Button */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonIcon}>{"↻"}</Text>
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <Animated.View style={glowAnimStyle}>
          <TouchableOpacity
            style={[
              styles.playButton,
              { backgroundColor: modeColor },
              isRunning && {
                shadowColor: modeColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 12,
              },
            ]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonIcon}>
              {isRunning ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonIcon}>{"⏭"}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => setShowAmbient(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>🎵</Text>
          <Text style={styles.quickActionLabel}>Sounds</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => setShowThemes(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>🎨</Text>
          <Text style={styles.quickActionLabel}>Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/goals')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>🎯</Text>
          <Text style={styles.quickActionLabel}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>👤</Text>
          <Text style={styles.quickActionLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/calendar')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={styles.quickActionLabel}>Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AmbientSoundPlayer visible={showAmbient} onClose={() => setShowAmbient(false)} />
      <BackgroundThemeSelector visible={showThemes} onClose={() => setShowThemes(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingHorizontal: Spacing.safeMargin,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  brandIcon: {
    fontSize: 22,
    color: Colors.primary,
  },
  brandName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  /* Mode Selector */
  modeSelector: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    backgroundColor: Colors.surfaceContainerLow,
  },
  modeChipText: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 12,
    letterSpacing: 0.6,
    color: Colors.onSurfaceVariant,
  },

  /* Timer */
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  timerDisplayOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -2,
  },
  timerSubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },

  /* Cycle Dots */
  cycleDots: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.md,
  },
  cycleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* Task Chip */
  taskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    maxWidth: '80%',
    gap: Spacing.base,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskChipText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurface,
    flexShrink: 1,
  },

  /* Controls */
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonIcon: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
  },

  /* Quick Actions */
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 'auto',
    marginBottom: 100,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minWidth: 60,
  },
  quickActionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
  },
});
