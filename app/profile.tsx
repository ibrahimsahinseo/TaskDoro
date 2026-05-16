import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const { profile } = state;
  const totalHours = Math.floor(profile.totalFocusMinutes / 60);

  const achievementData: Record<string, { icon: string; label: string; color: string }> = {
    fast_starter: { icon: '⚡', label: t.fastStarter, color: c.primary },
    '10k_minutes': { icon: '🏆', label: t.tenKMinutes, color: c.tertiary },
    night_owl: { icon: '🌙', label: t.nightOwl, color: c.secondary },
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant + '20' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text style={[styles.backIcon, { color: c.onSurface }]}>←</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.profileTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: c.primaryContainer, borderColor: c.primary }]}>
            <Text style={[styles.avatarText, { color: c.onPrimaryContainer }]}>{profile.name.split(' ').map((n) => n[0]).join('')}</Text>
          </View>
          <Text style={[styles.profileName, { color: c.onSurface }]}>{profile.name}</Text>
          <View style={[styles.proBadge, { backgroundColor: `${c.tertiaryContainer}20`, borderColor: `${c.tertiary}30` }]}>
            <Text style={[styles.proBadgeText, { color: c.tertiary }]}>✓ {t.deepPro}</Text>
          </View>
          <Text style={[styles.profileTitle2, { color: c.onSurfaceVariant }]}>{profile.title}</Text>
          <View style={styles.profileActions}>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: c.surfaceContainerHigh }]} onPress={() => Alert.alert(t.editProfile)}>
              <Text style={[styles.editButtonText, { color: c.onSurface }]}>✏ {t.editProfile}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, { borderColor: c.outlineVariant }]} onPress={() => Alert.alert(t.share)}>
              <Text style={[styles.shareButtonText, { color: c.onSurface }]}>↗ {t.share}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsGrid}>
          <View style={[styles.statCard, { flex: 2, backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
            <View style={styles.statHeader}><Text style={[styles.statIcon, { color: c.primary }]}>⏱</Text><Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>{t.totalFocus}</Text></View>
            <Text style={[styles.statValueLarge, { color: c.onSurface }]}>{totalHours}<Text style={[styles.statUnit, { color: c.onSurfaceVariant }]}>h</Text></Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
            <View style={styles.statHeader}><Text style={[styles.statIcon, { color: c.tertiary }]}>🔥</Text><Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>{t.streak}</Text></View>
            <Text style={[styles.statValue, { color: c.onSurface }]}>{profile.currentStreak} <Text style={[styles.statUnit, { color: c.onSurfaceVariant }]}>{t.days}</Text></Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
            <View style={styles.statHeader}><Text style={[styles.statIcon, { color: c.secondary }]}>🏅</Text><Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>{t.rank}</Text></View>
            <Text style={[styles.statValue, { color: c.onSurface }]}>{t.top5}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.achievementsCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>🏆 {t.achievements}</Text>
          <View style={styles.achievementsGrid}>
            {profile.achievements.map((key) => {
              const ach = achievementData[key];
              if (!ach) return null;
              return (
                <View key={key} style={[styles.achievementItem, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
                  <View style={[styles.achievementIcon, { backgroundColor: `${ach.color}20` }]}><Text style={{ fontSize: 24 }}>{ach.icon}</Text></View>
                  <Text style={[styles.achievementLabel, { color: c.onSurfaceVariant }]}>{ach.label}</Text>
                </View>
              );
            })}
            {[1, 2].map((i) => (
              <View key={`locked-${i}`} style={[styles.achievementItem, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20', opacity: 0.4 }]}>
                <View style={[styles.achievementIcon, { backgroundColor: c.surfaceVariant }]}><Text style={{ fontSize: 24 }}>🔒</Text></View>
                <Text style={[styles.achievementLabel, { color: c.onSurfaceVariant }]}>{t.locked}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.activityCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>📋 {t.recentActivity}</Text>
          {[
            { icon: '💻', title: t.deepWorkApi, time: t.todayTime, dur: '+120m', color: c.primary },
            { icon: '📖', title: t.readingSystem, time: t.yesterdayTime, dur: '+45m', color: c.tertiary },
          ].map((item, i) => (
            <View key={i} style={[styles.activityItem, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }]}>
              <View style={[styles.activityIcon, { backgroundColor: `${item.color}15` }]}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: c.onSurface }]}>{item.title}</Text>
                <Text style={[styles.activityTime, { color: c.onSurfaceVariant }]}>{item.time}</Text>
              </View>
              <Text style={[styles.activityDuration, { color: item.color }]}>{item.dur}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={[styles.accountCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.sectionTitleSmall, { color: c.onSurface }]}>{t.account}</Text>
          {[
            { icon: '⚙', label: t.preferencesLabel },
            { icon: '🔔', label: t.notifications },
            { icon: '❓', label: t.support },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={[styles.accountItem, { backgroundColor: c.surfaceContainerHigh }]} onPress={() => Alert.alert(item.label)}>
              <Text style={styles.accountIcon}>{item.icon}</Text>
              <Text style={[styles.accountLabel, { color: c.onSurface }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.divider, { backgroundColor: c.outlineVariant + '20' }]} />
          <TouchableOpacity style={[styles.accountItem, { backgroundColor: c.surfaceContainerHigh }]} onPress={() => Alert.alert(t.logOut)}>
            <Text style={styles.accountIcon}>🚪</Text>
            <Text style={[styles.accountLabel, { color: c.error }]}>{t.logOut}</Text>
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
  profileCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, alignItems: 'center', marginBottom: Spacing.md },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 3, marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  profileName: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  proBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1, marginBottom: 8 },
  proBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  profileTitle2: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  profileActions: { flexDirection: 'row', gap: 12, width: '100%' },
  editButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  editButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  shareButton: { flex: 1, borderWidth: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  shareButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  statCard: { flex: 1, minWidth: (width - 64) / 3, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statIcon: { fontSize: 16 },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  statValueLarge: { fontSize: 42, fontWeight: '700' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statUnit: { fontSize: 16, fontWeight: '400' },
  achievementsCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  sectionTitleSmall: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievementItem: { alignItems: 'center', width: (width - 100) / 4, padding: 8, borderRadius: 12, borderWidth: 1 },
  achievementIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  achievementLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },
  activityCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '500' },
  activityTime: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  activityDuration: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  accountCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1 },
  accountItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, marginBottom: 8 },
  accountIcon: { fontSize: 18 },
  accountLabel: { fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginVertical: 4 },
});
