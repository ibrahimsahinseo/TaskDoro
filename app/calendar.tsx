import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

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
  const c = useThemeColors();
  const t = useTranslation();

  const MONTHS = [t.january, t.february, t.march, t.april, t.may, t.june, t.july, t.august, t.september, t.october, t.november, t.december];
  const DAYS = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];

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
        const color = s.type === 'focus' ? c.primary : s.type === 'shortBreak' ? c.mint : c.seaBlue;
        if (!dates[day].colors.includes(color)) dates[day].colors.push(color);
      }
    });
    if (Object.keys(dates).length === 0) {
      dates[5] = { count: 1, colors: [c.primary] };
      dates[9] = { count: 2, colors: [c.primary, c.tertiary] };
      dates[today] = { count: 1, colors: [c.primary, '#4285F4'] };
      dates[12] = { count: 1, colors: [c.primary] };
      dates[17] = { count: 1, colors: ['#0078D4'] };
    }
    return dates;
  }, [state.sessions, currentYear, currentMonth, c]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const cellSize = (width - 40 - 12) / 7;

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant + '20' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: c.onSurface }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.calendarTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.pageTitle, { color: c.onSurface }]}>{t.calendarTitle}</Text>
              <Text style={[styles.pageSubtitle, { color: c.onSurfaceVariant }]}>{t.planSessions}</Text>
            </View>
            <View style={styles.integrations}>
              <View style={[styles.integrationBadge, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
                <View style={[styles.integrationDot, { backgroundColor: '#4285F4' }]} />
                <Text style={[styles.integrationText, { color: c.onSurfaceVariant }]}>Google</Text>
              </View>
              <View style={[styles.integrationBadge, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
                <View style={[styles.integrationDot, { backgroundColor: '#0078D4' }]} />
                <Text style={[styles.integrationText, { color: c.onSurfaceVariant }]}>Outlook</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.calendarCard, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
          <View style={[styles.calendarGlow, { backgroundColor: `${c.primary}08` }]} />

          <View style={styles.monthNav}>
            <Text style={[styles.monthTitle, { color: c.onSurface }]}>{MONTHS[currentMonth]} {currentYear}</Text>
            <View style={styles.monthButtons}>
              <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
                <Text style={[styles.navButtonText, { color: c.onSurfaceVariant }]}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
                <Text style={[styles.navButtonText, { color: c.onSurfaceVariant }]}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <Text key={day} style={[styles.dayHeaderText, { width: cellSize, color: c.onSurfaceVariant }]}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = day === selectedDay;
              const isToday = isCurrentMonth && day === today;
              const isPast = isCurrentMonth && day !== null && day < today - 3;
              const sessionInfo = day ? sessionDates[day] : null;
              return (
                <TouchableOpacity key={index} style={[{ width: cellSize, height: cellSize, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }, isSelected && { backgroundColor: `${c.primary}20`, borderWidth: 1, borderColor: `${c.primary}30` }, isPast && { opacity: 0.5 }]} disabled={!day} onPress={() => day && setSelectedDay(day)}>
                  {day && (
                    <>
                      <Text style={[styles.dayText, { color: c.onSurface }, isSelected && { color: c.primary, fontWeight: '700' }, isToday && !isSelected && { color: c.primary }]}>{day}</Text>
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

          <Text style={[styles.calendarHint, { color: `${c.onSurfaceVariant}60` }]}>{t.longPressHint}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.upcomingCard, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.upcomingTitle, { color: c.onSurface }]}>{t.upcoming}</Text>

          <View style={[styles.sessionCard, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant + '20' }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTime, { color: c.primary }]}>{t.today}, 2:00 PM</Text>
              <Text style={[styles.sessionMore, { color: c.onSurfaceVariant }]}>⋮</Text>
            </View>
            <Text style={[styles.sessionTitle, { color: c.onSurface }]}>{t.deepWorkBlock}</Text>
            <View style={styles.sessionFooter}>
              <Text style={[styles.sessionDuration, { color: c.onSurfaceVariant }]}>⏱ 120 min</Text>
              <View style={[styles.sessionTag, { backgroundColor: `${c.primary}15` }]}>
                <Text style={[styles.sessionTagText, { color: c.primary }]}>{t.coding}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sessionCard, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant + '20', borderLeftWidth: 3, borderLeftColor: '#4285F4' }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTime, { color: c.onSurfaceVariant }]}>{t.tomorrow}, 10:00 AM</Text>
              <Text style={[styles.sessionMore, { color: c.onSurfaceVariant }]}>⋮</Text>
            </View>
            <Text style={[styles.sessionTitle, { color: c.onSurface }]}>{t.teamSync}</Text>
            <View style={styles.sessionFooter}>
              <Text style={[styles.sessionDuration, { color: c.onSurfaceVariant }]}>⏱ 45 min</Text>
              <Text style={{ color: '#4285F4', fontSize: 14 }}>📅</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.addSessionButton, { borderColor: c.outlineVariant }]} onPress={() => Alert.alert(t.addSession)}>
            <Text style={[styles.addSessionText, { color: c.onSurfaceVariant }]}>{t.addSession}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.safeMargin, height: 56, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.safeMargin, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  pageTitle: { fontSize: 28, fontWeight: '700' },
  pageSubtitle: { fontSize: 15, marginTop: 4 },
  integrations: { flexDirection: 'row', gap: 8 },
  integrationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  integrationDot: { width: 8, height: 8, borderRadius: 4 },
  integrationText: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  calendarCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.md },
  calendarGlow: { position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: 100 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  monthTitle: { fontSize: 22, fontWeight: '700' },
  monthButtons: { flexDirection: 'row', gap: 4 },
  navButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navButtonText: { fontSize: 24 },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderText: { textAlign: 'center', fontSize: 10, fontWeight: '600', letterSpacing: 1, paddingVertical: 6 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayText: { fontSize: 15, fontWeight: '500' },
  dotContainer: { position: 'absolute', bottom: 4, flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  calendarHint: { textAlign: 'center', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginTop: 12 },
  upcomingCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1 },
  upcomingTitle: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.md },
  sessionCard: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sessionTime: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  sessionMore: { fontSize: 18 },
  sessionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  sessionFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionDuration: { fontSize: 13 },
  sessionTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sessionTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  addSessionButton: { width: '100%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  addSessionText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});
