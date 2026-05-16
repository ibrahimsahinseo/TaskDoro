import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useApp();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = now.getDate();
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const sessionDates = useMemo(() => {
    const dates: Record<number, { count: number; colors: string[] }> = {};
    state.sessions.forEach((s) => {
      const d = new Date(s.completedAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!dates[day]) dates[day] = { count: 0, colors: [] };
        dates[day].count++;
        const color =
          s.type === 'focus' ? Colors.primary : s.type === 'shortBreak' ? Colors.mint : Colors.seaBlue;
        if (!dates[day].colors.includes(color)) dates[day].colors.push(color);
      }
    });
    // Add some demo dots
    if (Object.keys(dates).length === 0) {
      dates[5] = { count: 1, colors: [Colors.primary] };
      dates[9] = { count: 2, colors: [Colors.primary, Colors.tertiary] };
      dates[today] = { count: 1, colors: [Colors.primary, '#4285F4'] };
      dates[12] = { count: 1, colors: [Colors.primary] };
      dates[17] = { count: 1, colors: ['#0078D4'] };
    }
    return dates;
  }, [state.sessions, currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar & Integration badges */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.pageTitle}>Calendar</Text>
              <Text style={styles.pageSubtitle}>Plan your focus sessions</Text>
            </View>
            <View style={styles.integrations}>
              <View style={styles.integrationBadge}>
                <View style={[styles.integrationDot, { backgroundColor: '#4285F4' }]} />
                <Text style={styles.integrationText}>Google</Text>
              </View>
              <View style={styles.integrationBadge}>
                <View style={[styles.integrationDot, { backgroundColor: '#0078D4' }]} />
                <Text style={styles.integrationText}>Outlook</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Calendar Widget */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.calendarCard}>
          <View style={styles.calendarGlow} />

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Text style={styles.monthTitle}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <View style={styles.monthButtons}>
              <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.dayHeaderText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = day === selectedDay;
              const isToday = isCurrentMonth && day === today;
              const isPast = isCurrentMonth && day !== null && day < today - 3;
              const sessionInfo = day ? sessionDates[day] : null;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isPast && { opacity: 0.5 },
                  ]}
                  disabled={!day}
                  onPress={() => day && setSelectedDay(day)}
                >
                  {day && (
                    <>
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          isToday && !isSelected && { color: Colors.primary },
                        ]}
                      >
                        {day}
                      </Text>
                      {sessionInfo && (
                        <View style={styles.dotContainer}>
                          {sessionInfo.colors.slice(0, 3).map((color, i) => (
                            <View key={i} style={[styles.dot, { backgroundColor: color }]} />
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.calendarHint}>Long-press any date to schedule a focus session</Text>
        </Animated.View>

        {/* Upcoming Sessions */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.upcomingCard}>
          <Text style={styles.upcomingTitle}>Upcoming</Text>

          {/* Session 1 */}
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTime}>TODAY, 2:00 PM</Text>
              <Text style={styles.sessionMore}>⋮</Text>
            </View>
            <Text style={styles.sessionTitle}>Deep Work Block</Text>
            <View style={styles.sessionFooter}>
              <Text style={styles.sessionDuration}>⏱ 120 min</Text>
              <View style={styles.sessionTag}>
                <Text style={styles.sessionTagText}>CODING</Text>
              </View>
            </View>
          </View>

          {/* Session 2 */}
          <View style={[styles.sessionCard, { borderLeftWidth: 3, borderLeftColor: '#4285F4' }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTime, { color: Colors.onSurfaceVariant }]}>
                TOMORROW, 10:00 AM
              </Text>
              <Text style={styles.sessionMore}>⋮</Text>
            </View>
            <Text style={styles.sessionTitle}>Team Sync & Planning</Text>
            <View style={styles.sessionFooter}>
              <Text style={styles.sessionDuration}>⏱ 45 min</Text>
              <Text style={{ color: '#4285F4', fontSize: 14 }}>📅</Text>
            </View>
          </View>

          {/* Add Session Button */}
          <TouchableOpacity style={styles.addSessionButton}>
            <Text style={styles.addSessionText}>+ ADD SESSION</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const cellSize = (width - 40 - 12) / 7;

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.safeMargin,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  integrations: {
    flexDirection: 'row',
    gap: 8,
  },
  integrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  integrationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  integrationText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
  },
  calendarCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  calendarGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}08`,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  monthButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.onSurfaceVariant,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    width: cellSize,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    paddingVertical: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  dayTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  calendarHint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: `${Colors.onSurfaceVariant}60`,
    marginTop: 12,
  },
  upcomingCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  upcomingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  sessionCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionTime: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.primary,
  },
  sessionMore: {
    fontSize: 18,
    color: Colors.onSurfaceVariant,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDuration: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  sessionTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: `${Colors.primary}15`,
  },
  sessionTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.primary,
  },
  addSessionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addSessionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
  },
});
