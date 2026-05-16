import React from 'react';
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
const WORK_HEIGHTS = [40, 60, 80, 50, 70, 30, 20];
const BREAK_HEIGHTS = [20, 30, 40, 25, 35, 15, 10];
const HEATMAP_COLS = 6;
const HEATMAP_ROWS = 5;
const heatmapData = [0.1,0.3,0.7,0.9,0.2,0.5,0.4,0.8,1.0,0.6,0.3,0.1,0.2,0.5,0.9,0.7,0.4,0.8,0.6,1.0,0.3,0.2,0.5,0.9,0.7,0.4,0.1,0.8,0.6,0.3];

function DonutChart({ c, t }: { c: ThemeColors; t: Translations }) {
  const segments = [
    { label: t.dev, percent: 45, color: c.primary },
    { label: t.write, percent: 25, color: c.secondary },
    { label: t.read, percent: 15, color: c.tertiary },
  ];
  let cum = 0;
  return (
    <View style={styles.donutSection}>
      <View style={{ width: DONUT_SIZE, height: DONUT_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
          <Circle cx={DONUT_CENTER} cy={DONUT_CENTER} r={DONUT_RADIUS} stroke={c.surfaceVariant} strokeWidth={DONUT_STROKE} fill="none" opacity={0.3} />
          {segments.map((seg, i) => {
            const dash = (seg.percent / 100) * DONUT_CIRCUMFERENCE;
            const gap = DONUT_CIRCUMFERENCE - dash;
            const off = -(cum / 100) * DONUT_CIRCUMFERENCE;
            cum += seg.percent;
            return <Circle key={i} cx={DONUT_CENTER} cy={DONUT_CENTER} r={DONUT_RADIUS} stroke={seg.color} strokeWidth={DONUT_STROKE} fill="none" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`} />;
          })}
        </Svg>
        <View style={{ position: 'absolute' }}><Text style={[styles.donutCenterText, { color: c.onSurface }]}>85%</Text></View>
      </View>
      <View style={styles.donutLegendContainer}>
        {segments.map((seg) => (
          <View key={seg.label} style={styles.donutLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={[styles.donutLegendText, { color: c.onSurfaceVariant }]}>{seg.label} ({seg.percent}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BarChart({ c, t }: { c: ThemeColors; t: Translations }) {
  const DAYS = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
  return (
    <View>
      <View style={styles.barLegend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: c.primary }]} /><Text style={[styles.legendText, { color: c.onSurfaceVariant }]}>{t.work}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: c.surfaceVariant }]} /><Text style={[styles.legendText, { color: c.onSurfaceVariant }]}>{t.break_}</Text></View>
      </View>
      <View style={styles.barChartRow}>
        {DAYS.map((day, i) => {
          const hl = i === 2;
          return (
            <View key={day} style={styles.barGroup}>
              <View style={styles.barPair}>
                <View style={[styles.bar, { height: (WORK_HEIGHTS[i] / 100) * BAR_CHART_HEIGHT, backgroundColor: c.primary, opacity: hl ? 1 : 0.6 }]} />
                <View style={[styles.bar, { height: (BREAK_HEIGHTS[i] / 100) * BAR_CHART_HEIGHT, backgroundColor: c.surfaceVariant, opacity: hl ? 0.8 : 0.5 }]} />
              </View>
              <Text style={[styles.barLabel, { color: c.onSurfaceVariant }, hl && { color: c.primary, fontWeight: '700' }]}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ActivityHeatmap({ c, t }: { c: ThemeColors; t: Translations }) {
  const sz = Math.min(Math.floor((SCREEN_WIDTH - 40 - 40 - 20) / HEATMAP_COLS), 20);
  return (
    <View>
      <View style={styles.heatmapGrid}>
        {Array.from({ length: HEATMAP_ROWS }).map((_, r) => (
          <View key={r} style={styles.heatmapRow}>
            {Array.from({ length: HEATMAP_COLS }).map((_, col) => (
              <View key={col} style={{ width: sz, height: sz, borderRadius: 3, backgroundColor: c.primary, opacity: heatmapData[r * HEATMAP_COLS + col] ?? 0.1 }} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={[styles.heatmapLegendLabel, { color: c.onSurfaceVariant }]}>{t.less}</Text>
        {[0.15, 0.35, 0.55, 0.75, 1.0].map((op, i) => (<View key={i} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c.primary, opacity: op, marginHorizontal: 2 }} />))}
        <Text style={[styles.heatmapLegendLabel, { color: c.onSurfaceVariant }]}>{t.more}</Text>
      </View>
    </View>
  );
}

function TrendIcon({ color }: { color: string }) {
  return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M22 7l-8.5 8.5-5-5L2 17" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 7h6v6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const t = useTranslation();

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: c.background }]} contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.analytics}</Text>
        <Text style={[styles.headerSubtitle, { color: c.onSurfaceVariant }]}>{t.performanceMetrics}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScrollContent} style={styles.kpiScroll}>
          <View style={[styles.kpiCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <Text style={[styles.kpiLabel, { color: c.onSurfaceVariant }]}>{t.timeFocusedToday}</Text>
            <Text style={[styles.kpiValue, { color: c.primary }]}>4h 20m</Text>
            <View style={styles.kpiTrend}><TrendIcon color={c.tertiary} /><Text style={[styles.kpiTrendText, { color: c.tertiary }]}>{t.fromYesterday}</Text></View>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <Text style={[styles.kpiLabel, { color: c.onSurfaceVariant }]}>{t.completedTasks}</Text>
            <Text style={[styles.kpiValue, { color: c.secondary }]}>12 / 15</Text>
            <Text style={[styles.kpiSubtext, { color: c.onSurfaceVariant }]}>{t.completionRate}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <Text style={[styles.kpiLabel, { color: c.onSurfaceVariant }]}>{t.efficiencyScore}</Text>
            <Text style={[styles.kpiValue, { color: c.tertiary }]}>92</Text>
            <View style={[styles.progressBarTrack, { backgroundColor: c.surfaceVariant }]}><View style={[styles.progressBarFill, { width: '92%', backgroundColor: c.tertiary }]} /></View>
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={[styles.sectionCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.weeklyFocusTrends}</Text>
        <BarChart c={c} t={t} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={[styles.sectionCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.focusByTask}</Text>
        <DonutChart c={c} t={t} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={[styles.sectionCard, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{t.activityHeatmap}</Text>
        <Text style={[styles.sectionSubtitle, { color: c.onSurfaceVariant }]}>{t.last30Days}</Text>
        <ActivityHeatmap c={c} t={t} />
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
  kpiValue: { fontFamily: 'monospace', fontSize: 32, lineHeight: 38, letterSpacing: -1.5, fontWeight: '700', marginBottom: 12 },
  kpiTrend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiTrendText: { fontSize: 12, lineHeight: 16 },
  kpiSubtext: { fontSize: 13, lineHeight: 18 },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  sectionCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: 20, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '600', lineHeight: 24, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  barLegend: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, lineHeight: 16 },
  barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: BAR_CHART_HEIGHT + 24 },
  barGroup: { alignItems: 'center', flex: 1 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: BAR_CHART_HEIGHT },
  bar: { width: 12, borderRadius: 4 },
  barLabel: { fontSize: 10, fontWeight: '600', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  donutSection: { alignItems: 'center', marginTop: 12 },
  donutCenterText: { fontFamily: 'monospace', fontSize: 24, lineHeight: 28, fontWeight: '700' },
  donutLegendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' },
  donutLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  donutLegendText: { fontSize: 13, lineHeight: 18 },
  heatmapGrid: { gap: 4, alignItems: 'center' },
  heatmapRow: { flexDirection: 'row', gap: 4 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 4 },
  heatmapLegendLabel: { fontSize: 11, lineHeight: 14, marginHorizontal: 4 },
});
