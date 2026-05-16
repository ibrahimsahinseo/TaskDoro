import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Svg, Circle, Path } from 'react-native-svg';
import { useApp, useThemeColors, useTranslation } from '../../contexts/AppContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const formatTime = (minutes: number): string => `${Math.floor(minutes).toString().padStart(2, '0')}:00`;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const { settings } = state;

  const updateSetting = (updates: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  };

  const DurationControl = ({ label, value, min, max, color, onChange }: { label: string; value: number; min: number; max: number; color: string; onChange: (v: number) => void }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <View style={styles.durationRow}>
        <View style={styles.durationHeader}>
          <Text style={[styles.durationLabel, { color: c.onSurface }]}>{label}</Text>
          <Text style={[styles.durationValue, { color }]}>{formatTime(value)}</Text>
        </View>
        <View style={styles.sliderContainer}>
          <TouchableOpacity onPress={() => onChange(Math.max(min, value - 1))} style={[styles.sliderButton, { backgroundColor: c.surfaceContainerHighest }]} activeOpacity={0.6}>
            <Text style={[styles.sliderButtonText, { color: c.onSurface }]}>-</Text>
          </TouchableOpacity>
          <View style={[styles.trackOuter, { backgroundColor: c.outlineVariant }]}>
            <View style={[styles.trackFill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
          <TouchableOpacity onPress={() => onChange(Math.min(max, value + 1))} style={[styles.sliderButton, { backgroundColor: c.surfaceContainerHighest }]} activeOpacity={0.6}>
            <Text style={[styles.sliderButtonText, { color: c.onSurface }]}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rangeLabels}>
          <Text style={[styles.rangeText, { color: c.outline }]}>{min} {t.min}</Text>
          <Text style={[styles.rangeText, { color: c.outline }]}>{max} {t.min}</Text>
        </View>
      </View>
    );
  };

  const PreferenceRow = ({ title, subtitle, value, onToggle }: { title: string; subtitle: string; value: boolean; onToggle: (v: boolean) => void }) => (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={[styles.preferenceTitle, { color: c.onSurface }]}>{title}</Text>
        <Text style={[styles.preferenceSubtitle, { color: c.onSurfaceVariant }]}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: c.surfaceContainerHighest, true: `${c.primary}80` }} thumbColor={value ? c.primary : c.surfaceContainerLow} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: c.surfaceContainerHigh }]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={3} stroke={c.primary} strokeWidth={2} />
            <Path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={c.primary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.settings}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.sectionLabel, { color: c.primary }]}>{t.timerDurations}</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant }]}>
            <DurationControl label={t.focusSession} value={settings.focusDuration} min={5} max={60} color={c.primary} onChange={(v) => updateSetting({ focusDuration: v })} />
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <DurationControl label={t.shortBreak} value={settings.shortBreakDuration} min={1} max={15} color={c.tertiary} onChange={(v) => updateSetting({ shortBreakDuration: v })} />
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <DurationControl label={t.longBreak} value={settings.longBreakDuration} min={10} max={45} color={c.secondary} onChange={(v) => updateSetting({ longBreakDuration: v })} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.sectionLabel, { color: c.primary }]}>{t.cycleTarget}</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant }]}>
            <View style={styles.cycleRow}>
              <View style={styles.cycleTextBlock}>
                <Text style={[styles.preferenceTitle, { color: c.onSurface }]}>{t.longBreakInterval}</Text>
                <Text style={[styles.preferenceSubtitle, { color: c.onSurfaceVariant }]}>{t.cyclesBeforeLongBreak}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => updateSetting({ longBreakInterval: Math.max(2, settings.longBreakInterval - 1) })} style={[styles.stepperButton, { backgroundColor: c.surfaceContainerHighest }, settings.longBreakInterval <= 2 && { opacity: 0.3 }]} activeOpacity={0.6} disabled={settings.longBreakInterval <= 2}>
                  <Text style={[styles.stepperButtonText, { color: c.onSurface }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: c.primary }]}>{settings.longBreakInterval}</Text>
                <TouchableOpacity onPress={() => updateSetting({ longBreakInterval: Math.min(8, settings.longBreakInterval + 1) })} style={[styles.stepperButton, { backgroundColor: c.surfaceContainerHighest }, settings.longBreakInterval >= 8 && { opacity: 0.3 }]} activeOpacity={0.6} disabled={settings.longBreakInterval >= 8}>
                  <Text style={[styles.stepperButtonText, { color: c.onSurface }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <View style={styles.cycleRow}>
              <View style={styles.cycleTextBlock}>
                <Text style={[styles.preferenceTitle, { color: c.onSurface }]}>{t.dailyTargetSetting}</Text>
                <Text style={[styles.preferenceSubtitle, { color: c.onSurfaceVariant }]}>{t.dailyTargetDesc}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => dispatch({ type: 'UPDATE_TIMER', payload: { dailyTarget: Math.max(1, state.timer.dailyTarget - 1) } })} style={[styles.stepperButton, { backgroundColor: c.surfaceContainerHighest }, state.timer.dailyTarget <= 1 && { opacity: 0.3 }]} activeOpacity={0.6} disabled={state.timer.dailyTarget <= 1}>
                  <Text style={[styles.stepperButtonText, { color: c.onSurface }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: c.tertiary }]}>{state.timer.dailyTarget}</Text>
                <TouchableOpacity onPress={() => dispatch({ type: 'UPDATE_TIMER', payload: { dailyTarget: Math.min(20, state.timer.dailyTarget + 1) } })} style={[styles.stepperButton, { backgroundColor: c.surfaceContainerHighest }, state.timer.dailyTarget >= 20 && { opacity: 0.3 }]} activeOpacity={0.6} disabled={state.timer.dailyTarget >= 20}>
                  <Text style={[styles.stepperButtonText, { color: c.onSurface }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[styles.sectionLabel, { color: c.primary }]}>{t.preferences}</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant }]}>
            <PreferenceRow title={t.autoStartNext} subtitle={t.autoStartDesc} value={settings.autoStartNext} onToggle={(v) => updateSetting({ autoStartNext: v })} />
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <PreferenceRow title={t.soundNotifications} subtitle={t.soundDesc} value={settings.soundEnabled} onToggle={(v) => updateSetting({ soundEnabled: v })} />
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <PreferenceRow title={t.vibration} subtitle={t.vibrationDesc} value={settings.vibrationEnabled} onToggle={(v) => updateSetting({ vibrationEnabled: v })} />
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <PreferenceRow title={t.darkTheme} subtitle={t.darkThemeDesc} value={settings.darkTheme} onToggle={(v) => updateSetting({ darkTheme: v })} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={[styles.sectionLabel, { color: c.primary }]}>{t.language}</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant }]}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceTitle, { color: c.onSurface }]}>{t.languageLabel}</Text>
                <Text style={[styles.preferenceSubtitle, { color: c.onSurfaceVariant }]}>{t.languageDesc}</Text>
              </View>
              <View style={styles.langButtons}>
                <TouchableOpacity style={[styles.langBtn, { borderColor: c.outlineVariant }, settings.language === 'en' && { backgroundColor: c.primary, borderColor: c.primary }]} onPress={() => updateSetting({ language: 'en' })}>
                  <Text style={[styles.langBtnText, { color: settings.language === 'en' ? c.onPrimary : c.onSurfaceVariant }]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.langBtn, { borderColor: c.outlineVariant }, settings.language === 'tr' && { backgroundColor: c.primary, borderColor: c.primary }]} onPress={() => updateSetting({ language: 'tr' })}>
                  <Text style={[styles.langBtnText, { color: settings.language === 'tr' ? c.onPrimary : c.onSurfaceVariant }]}>TR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.safeMargin, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', lineHeight: 32, textAlign: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: Spacing.md, marginBottom: Spacing.base, marginHorizontal: Spacing.safeMargin },
  card: { borderRadius: BorderRadius.xl, borderWidth: 1, marginHorizontal: Spacing.safeMargin, padding: Spacing.md },
  divider: { height: 1, marginVertical: Spacing.md, opacity: 0.4 },
  durationRow: { gap: Spacing.sm },
  durationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationLabel: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  durationValue: { fontFamily: 'monospace', fontSize: 20, lineHeight: 24, fontWeight: '700', letterSpacing: -1 },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sliderButton: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  sliderButtonText: { fontFamily: 'monospace', fontSize: 20, lineHeight: 24, fontWeight: '700' },
  trackOuter: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 2 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 48 },
  rangeText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  cycleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cycleTextBlock: { flex: 1, marginRight: Spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepperButton: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  stepperButtonText: { fontFamily: 'monospace', fontSize: 20, lineHeight: 24, fontWeight: '700' },
  stepperValue: { fontFamily: 'monospace', fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -1, minWidth: 32, textAlign: 'center' },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preferenceText: { flex: 1, marginRight: Spacing.sm },
  preferenceTitle: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  preferenceSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  langButtons: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1 },
  langBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
