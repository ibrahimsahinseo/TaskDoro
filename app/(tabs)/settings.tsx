import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Svg, Circle, Path } from 'react-native-svg';
import { useApp } from '../../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const formatTime = (minutes: number): string => {
  const mins = Math.floor(minutes);
  return `${mins.toString().padStart(2, '0')}:00`;
};

interface DurationControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  onchange: (value: number) => void;
}

function DurationControl({ label, value, min, max, color, onchange }: DurationControlProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.durationRow}>
      <View style={styles.durationHeader}>
        <Text style={styles.durationLabel}>{label}</Text>
        <Text style={[styles.durationValue, { color }]}>{formatTime(value)}</Text>
      </View>
      <View style={styles.sliderContainer}>
        <TouchableOpacity
          onPress={() => onchange(Math.max(min, value - 1))}
          style={styles.sliderButton}
          activeOpacity={0.6}
        >
          <Text style={styles.sliderButtonText}>-</Text>
        </TouchableOpacity>
        <View style={styles.trackOuter}>
          <View style={[styles.trackFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <TouchableOpacity
          onPress={() => onchange(Math.min(max, value + 1))}
          style={styles.sliderButton}
          activeOpacity={0.6}
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>{min} min</Text>
        <Text style={styles.rangeText}>{max} min</Text>
      </View>
    </View>
  );
}

interface PreferenceRowProps {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

function PreferenceRow({ title, subtitle, value, onToggle, disabled }: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#36343a', true: 'rgba(207,188,255,0.5)' }}
        thumbColor={value ? '#cfbcff' : '#1d1b20'}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { settings } = state;

  const updateSetting = (updates: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={3} stroke={Colors.primary} strokeWidth={2} />
              <Path
                d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                stroke={Colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Timer Durations Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionLabel}>TIMER DURATIONS</Text>
          <View style={styles.card}>
            <DurationControl
              label="Focus Session"
              value={settings.focusDuration}
              min={5}
              max={60}
              color={Colors.primary}
              onchange={(v) => updateSetting({ focusDuration: v })}
            />
            <View style={styles.divider} />
            <DurationControl
              label="Short Break"
              value={settings.shortBreakDuration}
              min={1}
              max={15}
              color={Colors.tertiary}
              onchange={(v) => updateSetting({ shortBreakDuration: v })}
            />
            <View style={styles.divider} />
            <DurationControl
              label="Long Break"
              value={settings.longBreakDuration}
              min={10}
              max={45}
              color={Colors.secondary}
              onchange={(v) => updateSetting({ longBreakDuration: v })}
            />
          </View>
        </Animated.View>

        {/* Cycle Target Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionLabel}>CYCLE TARGET</Text>
          <View style={styles.card}>
            <View style={styles.cycleRow}>
              <View style={styles.cycleTextBlock}>
                <Text style={styles.preferenceTitle}>Long Break Interval</Text>
                <Text style={styles.preferenceSubtitle}>Cycles before a long break</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() =>
                    updateSetting({
                      longBreakInterval: Math.max(2, settings.longBreakInterval - 1),
                    })
                  }
                  style={[
                    styles.stepperButton,
                    settings.longBreakInterval <= 2 && styles.stepperButtonDisabled,
                  ]}
                  activeOpacity={0.6}
                  disabled={settings.longBreakInterval <= 2}
                >
                  <Text
                    style={[
                      styles.stepperButtonText,
                      settings.longBreakInterval <= 2 && styles.stepperButtonTextDisabled,
                    ]}
                  >
                    -
                  </Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{settings.longBreakInterval}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateSetting({
                      longBreakInterval: Math.min(8, settings.longBreakInterval + 1),
                    })
                  }
                  style={[
                    styles.stepperButton,
                    settings.longBreakInterval >= 8 && styles.stepperButtonDisabled,
                  ]}
                  activeOpacity={0.6}
                  disabled={settings.longBreakInterval >= 8}
                >
                  <Text
                    style={[
                      styles.stepperButtonText,
                      settings.longBreakInterval >= 8 && styles.stepperButtonTextDisabled,
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
            <PreferenceRow
              title="Auto-start Next Cycle"
              subtitle="Automatically begin the next timer"
              value={settings.autoStartNext}
              onToggle={(v) => updateSetting({ autoStartNext: v })}
            />
            <View style={styles.divider} />
            <PreferenceRow
              title="Sound Notifications"
              subtitle="Play sounds on completion"
              value={settings.soundEnabled}
              onToggle={(v) => updateSetting({ soundEnabled: v })}
            />
            <View style={styles.divider} />
            <PreferenceRow
              title="Vibration"
              subtitle="Haptic feedback on completion"
              value={settings.vibrationEnabled}
              onToggle={(v) => updateSetting({ vibrationEnabled: v })}
            />
            <View style={styles.divider} />
            <PreferenceRow
              title="Dark Theme"
              subtitle="Optimized for eye comfort"
              value={settings.darkTheme}
              onToggle={() => {}}
              disabled={true}
            />
          </View>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.safeMargin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 32,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },

  // Section label
  sectionLabel: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
    marginHorizontal: Spacing.safeMargin,
  },

  // Card
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginHorizontal: Spacing.safeMargin,
    padding: Spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginVertical: Spacing.md,
    opacity: 0.4,
  },

  // Duration control
  durationRow: {
    gap: Spacing.sm,
  },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  durationValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -1,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  trackOuter: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  rangeText: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: Colors.outline,
  },

  // Cycle target
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cycleTextBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.3,
  },
  stepperButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  stepperButtonTextDisabled: {
    color: Colors.outline,
  },
  stepperValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -1,
    color: Colors.primary,
    minWidth: 32,
    textAlign: 'center',
  },

  // Preferences
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  preferenceTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  preferenceSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
