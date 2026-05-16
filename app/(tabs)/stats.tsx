import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Svg, Circle, Path, Rect } from 'react-native-svg';
import { useApp } from '../../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_BG = Colors.cardBg;
const CARD_BORDER = 'rgba(255,255,255,0.05)';

// ------- Donut Chart -------
const DONUT_RADIUS = 60;
const DONUT_STROKE = 14;
const DONUT_SIZE = (DONUT_RADIUS + DONUT_STROKE) * 2;
const DONUT_CENTER = DONUT_SIZE / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

interface DonutSegment {
  label: string;
  percent: number;
  color: string;
}

const donutSegments: DonutSegment[] = [
  { label: 'Dev', percent: 45, color: Colors.primary },
  { label: 'Write', percent: 25, color: Colors.secondary },
  { label: 'Read', percent: 15, color: Colors.tertiary },
];

function DonutChart() {
  let cumulativePercent = 0;

  return (
    <View style={styles.donutContainer}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
        {/* Background track */}
        <Circle
          cx={DONUT_CENTER}
          cy={DONUT_CENTER}
          r={DONUT_RADIUS}
          stroke={Colors.surfaceVariant}
          strokeWidth={DONUT_STROKE}
          fill="none"
          opacity={0.3}
        />
        {donutSegments.map((segment, index) => {
          const dashLength = (segment.percent / 100) * DONUT_CIRCUMFERENCE;
          const dashGap = DONUT_CIRCUMFERENCE - dashLength;
          const offset = -(cumulativePercent / 100) * DONUT_CIRCUMFERENCE;
          cumulativePercent += segment.percent;

          return (
            <Circle
              key={index}
              cx={DONUT_CENTER}
              cy={DONUT_CENTER}
              r={DONUT_RADIUS}
              stroke={segment.color}
              strokeWidth={DONUT_STROKE}
              fill="none"
              strokeDasharray={`${dashLength} ${dashGap}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`}
            />
          );
        })}
      </Svg>
      <View style={styles.donutCenterLabel}>
        <Text style={styles.donutCenterText}>85%</Text>
      </View>
    </View>
  );
}

// ------- Bar Chart -------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WORK_HEIGHTS = [40, 60, 80, 50, 70, 30, 20];
const BREAK_HEIGHTS = [20, 30, 40, 25, 35, 15, 10];
const BAR_CHART_HEIGHT = 140;

function BarChart() {
  return (
    <View>
      {/* Legend */}
      <View style={styles.barLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Work</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.surfaceVariant }]} />
          <Text style={styles.legendText}>Break</Text>
        </View>
      </View>

      {/* Bars */}
      <View style={styles.barChartRow}>
        {DAYS.map((day, index) => {
          const isHighlighted = index === 2; // Wednesday
          return (
            <View key={day} style={styles.barGroup}>
              <View style={styles.barPair}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (WORK_HEIGHTS[index] / 100) * BAR_CHART_HEIGHT,
                      backgroundColor: Colors.primary,
                      opacity: isHighlighted ? 1 : 0.6,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: (BREAK_HEIGHTS[index] / 100) * BAR_CHART_HEIGHT,
                      backgroundColor: Colors.surfaceVariant,
                      opacity: isHighlighted ? 0.8 : 0.5,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  isHighlighted && { color: Colors.primary, fontFamily: 'JetBrainsMono-Bold' },
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ------- Activity Heatmap -------
const HEATMAP_COLS = 6;
const HEATMAP_ROWS = 5;

// Generate 30 pseudo-random opacity values for the heatmap
const heatmapData: number[] = [
  0.1, 0.3, 0.7, 0.9, 0.2, 0.5,
  0.4, 0.8, 1.0, 0.6, 0.3, 0.1,
  0.2, 0.5, 0.9, 0.7, 0.4, 0.8,
  0.6, 1.0, 0.3, 0.2, 0.5, 0.9,
  0.7, 0.4, 0.1, 0.8, 0.6, 0.3,
];

function ActivityHeatmap() {
  const squareSize = Math.floor((SCREEN_WIDTH - Spacing.safeMargin * 2 - 40 - (HEATMAP_COLS - 1) * 4) / HEATMAP_COLS);
  const clampedSize = Math.min(squareSize, 20);

  return (
    <View>
      <View style={styles.heatmapGrid}>
        {Array.from({ length: HEATMAP_ROWS }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.heatmapRow}>
            {Array.from({ length: HEATMAP_COLS }).map((_, colIndex) => {
              const dataIndex = rowIndex * HEATMAP_COLS + colIndex;
              const opacity = heatmapData[dataIndex] ?? 0.1;
              return (
                <View
                  key={colIndex}
                  style={[
                    styles.heatmapSquare,
                    {
                      width: clampedSize,
                      height: clampedSize,
                      backgroundColor: Colors.primary,
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Less / More legend */}
      <View style={styles.heatmapLegend}>
        <Text style={styles.heatmapLegendLabel}>Less</Text>
        {[0.15, 0.35, 0.55, 0.75, 1.0].map((op, i) => (
          <View
            key={i}
            style={[
              styles.heatmapSquare,
              {
                width: 12,
                height: 12,
                backgroundColor: Colors.primary,
                opacity: op,
                marginHorizontal: 2,
              },
            ]}
          />
        ))}
        <Text style={styles.heatmapLegendLabel}>More</Text>
      </View>
    </View>
  );
}

// ------- KPI: Efficiency Progress Bar -------
function MiniProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  );
}

// ------- Trending Up Icon -------
function TrendingUpIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 7l-8.5 8.5-5-5L2 17"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 7h6v6"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ------- Main Stats Screen -------
export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useApp();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 16,
          paddingBottom: 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500).delay(0)} style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your performance metrics</Text>
      </Animated.View>

      {/* KPI Cards */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScrollContent}
          style={styles.kpiScroll}
        >
          {/* Time Focused Today */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Time Focused Today</Text>
            <Text style={[styles.kpiValue, { color: Colors.primary }]}>4h 20m</Text>
            <View style={styles.kpiTrend}>
              <TrendingUpIcon color={Colors.tertiary} />
              <Text style={[styles.kpiTrendText, { color: Colors.tertiary }]}>+15% from yesterday</Text>
            </View>
          </View>

          {/* Completed Tasks */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Completed Tasks</Text>
            <Text style={[styles.kpiValue, { color: Colors.secondary }]}>12 / 15</Text>
            <Text style={styles.kpiSubtext}>80% completion rate</Text>
          </View>

          {/* Efficiency Score */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Efficiency Score</Text>
            <Text style={[styles.kpiValue, { color: Colors.tertiary }]}>92</Text>
            <MiniProgressBar percent={92} color={Colors.tertiary} />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Weekly Focus Trends */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Weekly Focus Trends</Text>
        <BarChart />
      </Animated.View>

      {/* Focus by Task - Donut Chart */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Focus by Task</Text>
        <View style={styles.donutSection}>
          <DonutChart />
          <View style={styles.donutLegendContainer}>
            {donutSegments.map((segment) => (
              <View key={segment.label} style={styles.donutLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                <Text style={styles.donutLegendText}>
                  {segment.label} ({segment.percent}%)
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Activity Heatmap */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Activity Heatmap</Text>
        <Text style={styles.sectionSubtitle}>Last 30 days</Text>
        <ActivityHeatmap />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.safeMargin,
  },

  // Header
  header: {
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 40,
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },

  // KPI Cards
  kpiScroll: {
    marginHorizontal: -Spacing.safeMargin,
    marginBottom: Spacing.md,
  },
  kpiScrollContent: {
    paddingHorizontal: Spacing.safeMargin,
    gap: 12,
  },
  kpiCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: BorderRadius.lg,
    padding: 20,
    width: SCREEN_WIDTH * 0.52,
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
  },
  kpiValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kpiTrendText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  kpiSubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },

  // Progress bar (Efficiency)
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Section cards
  sectionCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },

  // Bar Chart
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: BAR_CHART_HEIGHT + 24,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: BAR_CHART_HEIGHT,
  },
  bar: {
    width: 12,
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    lineHeight: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Donut Chart
  donutSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  donutContainer: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  donutLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donutLegendText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },

  // Heatmap
  heatmapGrid: {
    gap: 4,
    alignItems: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: 4,
  },
  heatmapSquare: {
    borderRadius: 3,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  heatmapLegendLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    lineHeight: 14,
    color: Colors.onSurfaceVariant,
    marginHorizontal: 4,
  },
});
