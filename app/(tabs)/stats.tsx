import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Svg, Circle, Path } from 'react-native-svg';
import { useApp, useThemeColors, useTranslation } from '../../contexts/AppContext';
import { Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { Translations } from '../../constants/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DONUT_RADIUS = 60;
const DONUT_STROKE = 14;
const DONUT_SIZE = (DONUT_RADIUS + DONUT_STROKE) * 2;
const DONUT_CENTER = DONUT_SIZE / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const BAR_CHART_HEIGHT = 140;

function DonutChart({ c, t, segments }: { c: ThemeColors; t: Translations; segments: { label: string; percent: number; color: string }[] }) {
  let cum = 0;
  const total = segments.reduce((s, seg) => s + seg.percent, 0);
  return (
    <View style={styles.donutSection}>
      <View style={{ width: DONUT_SIZE, height: DONUT_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
          <Circle cx={DONUT_CENTER} cy={DONUT_CENTER} r={DONUT_RADIUS} stroke={c.surfaceVariant} strokeWidth={DONUT_STROKE} fill="none" opacity={0.3} />
          {segments.map((seg, i) => {
            const pct = total > 0 ? seg.percent / total * 100 : 0;
            const dash = (pct / 100) * DONUT_CIRCUMFERENCE;
            const gap = DONUT_CIRCUMFERENCE - dash;
            const off = -(cum / 100) * DONUT_CIRCUMFERENCE;
            cum += pct;
            return <Circle key={i} cx={DONUT_CENTER} cy={DONUT_CENTER} r={DONUT_RADIUS} stroke={seg.color} strokeWidth={DONUT_STROKE} fill="none" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`} />;
          })}
        </Svg>
        <View style={{ position: 'absolute' }}><Text style={[styles.donutCenterText, { color: c.onSurface }]}>{total}</Text></View>
      </View>
      <View style={styles.donutLegendContainer}>
        {segments.map((seg) => (
          <View key={seg.label} style={styles.donutLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={[styles.donutLegendText, { color: c.onSurfaceVariant }]}>{seg.label} ({seg.percent})</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BarChart({ c, t, data }: { c: ThemeColors; t: Translations; data: number[] }) {
  const DAYS = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
  const maxVal = Math.max(...data, 1);
  return (
    <View>
      <View style={styles.barChartRow}>
        {DAYS.map((day, i) => {
          const h = (data[i] / maxVal) * BAR_CHART_HEIGHT;
          return (
            <View key={day} style={styles.barGroup}>
              <View style={styles.barPair}>
                <View style={[styles.bar, { height: Math.max(h, 4), backgroundColor: c.primary, opacity: data[i] > 0 ? 1 : 0.2 }]} />
              </View>
              <Text style={[styles.barLabel, { color: c.onSurfaceVariant }]}>{day}</Text>
              <Text style={[styles.barValue, { color: c.primary }]}>{data[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TrendIcon({ color }: { color: string }) {
  return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M22 7l-8.5 8.5-5-5L2 17" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 7h6v6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

const TAG_COLORS: Record<string, string> = { work: '#FF6B6B', study: '#45B7D1', coding: '#4ECDC4', reading: '#96CEB4', design: '#DDA0DD', writing: '#F7DC6F', meeting: '#85C1E9', exercise: '#98D8C8', creative: '#BB8FCE', other: '#FFEAA7' };

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const c = useThemeColors();
  const t = useTranslation();

  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.sessions.filter((s) => s.date === today && s.type === 'focus');
  }, [state.sessions]);

  const todayMinutes = useMemo(() => todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0), [todaySessions]);

  const weeklyData = useMemo(() => {
    const data = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const dayOfWeek = now.getDay();
    state.sessions.filter((s) => s.type === 'focus').forEach((s) => {
      const d = new Date(s.completedAt);
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff < 7) {
        const idx = (d.getDay() + 6) % 7;
        data[idx] += Math.round(s.duration / 60);
      }
    });
    return data;
  }, [state.sessions]);

  const tagBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    state.sessions.filter((s) => s.type === 'focus' && s.tag).forEach((s) => {
      counts[s.tag!] = (counts[s.tag!] || 0) + 1;
    });
    return Object.entries(counts).map(([tag, count]) => ({
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      percent: count,
      color: TAG_COLORS[tag] || c.primary,
    })).sort((a, b) => b.percent - a.percent).slice(0, 5);
  }, [state.sessions]);

  const recentSessions = useMemo(() => {
    return [...state.sessions].filter((s) => s.type === 'focus').reverse().slice(0, 10);
  }, [state.sessions]);

  const avgSession = todaySessions.length > 0 ? Math.round(todayMinutes / todaySessions.length) : 0;

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: c.background }]} contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.analytics}</Text>
        <Text style={[styles.headerSubtitle, { color: c.onSurfaceVariant }]}>{t.performanceMetrics}</Text>
      </Animated.View>

      {/* KPI Cards */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScrollContent} style={styles.kpiScroll}>
          <View style={[styles.kpiCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <Text style={[styles.kpiLabel, { color: c.onSurfaceVariant }]}>{t.totalToday}</Text>
            <Text style={[styles.kpiValue, { color: c.primary }]}>{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</Text>
            <View style={styles.kpiTrend}><TrendIcon color={c.tertiary} /><Text style={[styles.kpiTrendText, { color: c.tertiary }]}>{todaySessions.length} sessions</Text></View>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <Text style={[styles.kpiLabel, { color: c.onSurfaceVariant }]}>{t.sessionsToday}</Text>
            <Text style={[styles.kpiValue, { color: c.secondary }]}>{todaySessions.length}</Text>
            <Text style={[styles.kpiSubtext, { color: c.onSurfaceVariant }]}>{t.avgSession}: {avgSession}{t.min}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <Text style={[styles.kpiLabel, { color: c.onSurfaceVariant }]}>{t.efficiencyScore}</Text>
            <Text style={[styles.kpiValue, { color: c.tertiary }]}>{state.profile.level}</Text>
            <View style={[styles.progressBarTrack, { backgroundColor: c.surfaceVariant }]}><View style={[styles.progressBarFill, { width: '72%', backgroundColor: c.tertiary }]} /></View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Weekly Focus */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={[styles.sectionCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.weeklyFocusTrends}</Text>
        <Text style={[styles.sectionSubtitle, { color: c.onSurfaceVariant }]}>{t.min}</Text>
        <BarChart c={c} t={t} data={weeklyData} />
      </Animated.View>

      {/* Focus by Tag */}
      {tagBreakdown.length > 0 && (
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={[styles.sectionCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.focusByTask}</Text>
          <DonutChart c={c} t={t} segments={tagBreakdown} />
        </Animated.View>
      )}

      {/* Session History */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={[styles.sectionCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.sessionHistory}</Text>
        {recentSessions.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
            <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>{t.noSessions}</Text>
          </View>
        ) : (
          recentSessions.map((session) => (
            <View key={session.id} style={[styles.sessionItem, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '15' }]}>
              <View style={[styles.sessionColorDot, { backgroundColor: session.color || c.primary }]} />
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionName, { color: c.onSurface }]}>{session.name || session.tag || 'Focus'}</Text>
                <Text style={[styles.sessionMeta, { color: c.onSurfaceVariant }]}>{new Date(session.completedAt).toLocaleDateString()} · {Math.round(session.duration / 60)} {t.min}</Text>
              </View>
              {session.tag && (
                <View style={[styles.sessionTagBadge, { backgroundColor: `${TAG_COLORS[session.tag] || c.primary}20` }]}>
                  <Text style={[styles.sessionTagText, { color: TAG_COLORS[session.tag] || c.primary }]}>{session.tag}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: { paddingHorizontal: Spacing.safeMargin },
  header: { marginBottom: Spacing.md },
  headerTitle: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  headerSubtitle: { fontSize: 16, lineHeight: 24, marginTop: 4 },
  kpiScroll: { marginHorizontal: -Spacing.safeMargin, marginBottom: Spacing.md },
  kpiScrollContent: { paddingHorizontal: Spacing.safeMargin, gap: 12 },
  kpiCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: 20, width: SCREEN_WIDTH * 0.52, justifyContent: 'space-between' },
  kpiLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 },
  kpiValue: { fontFamily: 'monospace', fontSize: 28, lineHeight: 34, letterSpacing: -1.5, fontWeight: '700', marginBottom: 12 },
  kpiTrend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiTrendText: { fontSize: 12, lineHeight: 16 },
  kpiSubtext: { fontSize: 13, lineHeight: 18 },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  sectionCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: 20, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '600', lineHeight: 24, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: BAR_CHART_HEIGHT + 40 },
  barGroup: { alignItems: 'center', flex: 1 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: BAR_CHART_HEIGHT },
  bar: { width: 16, borderRadius: 4 },
  barLabel: { fontSize: 10, fontWeight: '600', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  barValue: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  donutSection: { alignItems: 'center', marginTop: 12 },
  donutCenterText: { fontFamily: 'monospace', fontSize: 24, lineHeight: 28, fontWeight: '700' },
  donutLegendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' },
  donutLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  donutLegendText: { fontSize: 13, lineHeight: 18 },
  emptyHistory: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14 },
  sessionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 8 },
  sessionColorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '600' },
  sessionMeta: { fontSize: 11, marginTop: 2 },
  sessionTagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sessionTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
