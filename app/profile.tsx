import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const achievementData: Record<string, { icon: string; label: string; color: string }> = {
  fast_starter: { icon: '⚡', label: 'Fast Starter', color: Colors.primary },
  '10k_minutes': { icon: '🏆', label: '10k Minutes', color: Colors.tertiary },
  night_owl: { icon: '🌙', label: 'Night Owl', color: Colors.secondary },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useApp();
  const { profile } = state;

  const totalHours = Math.floor(profile.totalFocusMinutes / 60);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>✓ DEEP PRO</Text>
            </View>
            <Text style={styles.profileTitle}>{profile.title}</Text>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>✏ Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>↗ Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsGrid}>
          <View style={[styles.statCard, { flex: 2 }]}>
            <View style={styles.statHeader}>
              <Text style={[styles.statIcon, { color: Colors.primary }]}>⏱</Text>
              <Text style={styles.statLabel}>TOTAL FOCUS</Text>
            </View>
            <Text style={styles.statValueLarge}>
              {totalHours}
              <Text style={styles.statUnit}>h</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={[styles.statIcon, { color: Colors.tertiary }]}>🔥</Text>
              <Text style={styles.statLabel}>STREAK</Text>
            </View>
            <Text style={styles.statValue}>
              {profile.currentStreak}{' '}
              <Text style={styles.statUnit}>Days</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={[styles.statIcon, { color: Colors.secondary }]}>🏅</Text>
              <Text style={styles.statLabel}>RANK</Text>
            </View>
            <Text style={styles.statValue}>Top 5%</Text>
          </View>
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementsGrid}>
            {profile.achievements.map((key) => {
              const ach = achievementData[key];
              if (!ach) return null;
              return (
                <View key={key} style={styles.achievementItem}>
                  <View
                    style={[
                      styles.achievementIcon,
                      { backgroundColor: `${ach.color}20` },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{ach.icon}</Text>
                  </View>
                  <Text style={styles.achievementLabel}>{ach.label}</Text>
                </View>
              );
            })}
            {/* Locked achievements */}
            {[1, 2].map((i) => (
              <View key={`locked-${i}`} style={[styles.achievementItem, { opacity: 0.4 }]}>
                <View style={[styles.achievementIcon, { backgroundColor: Colors.surfaceVariant }]}>
                  <Text style={{ fontSize: 24 }}>🔒</Text>
                </View>
                <Text style={styles.achievementLabel}>Locked</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.activityCard}>
          <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${Colors.primary}15` }]}>
                <Text style={{ fontSize: 14 }}>💻</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Deep Work: API Design</Text>
                <Text style={styles.activityTime}>Today, 10:00 AM</Text>
              </View>
              <Text style={[styles.activityDuration, { color: Colors.primary }]}>+120m</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${Colors.tertiary}15` }]}>
                <Text style={{ fontSize: 14 }}>📖</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Reading: System Design</Text>
                <Text style={styles.activityTime}>Yesterday, 8:00 PM</Text>
              </View>
              <Text style={[styles.activityDuration, { color: Colors.tertiary }]}>+45m</Text>
            </View>
          </View>
        </Animated.View>

        {/* Account Links */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.accountCard}>
          <Text style={styles.sectionTitleSmall}>Account</Text>
          {[
            { icon: '⚙', label: 'Preferences' },
            { icon: '🔔', label: 'Notifications' },
            { icon: '❓', label: 'Support' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.accountItem}>
              <Text style={styles.accountIcon}>{item.icon}</Text>
              <Text style={styles.accountLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.accountItem}>
            <Text style={styles.accountIcon}>🚪</Text>
            <Text style={[styles.accountLabel, { color: Colors.error }]}>Log Out</Text>
          </TouchableOpacity>
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
  profileCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.tertiaryContainer}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${Colors.tertiary}30`,
    marginBottom: 8,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.tertiary,
  },
  profileTitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurface,
  },
  shareButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurface,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 3,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
  },
  statValueLarge: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  achievementsCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 16,
  },
  sectionTitleSmall: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    alignItems: 'center',
    width: (width - 100) / 4,
    padding: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  activityTime: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  activityDuration: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  accountCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  accountIcon: {
    fontSize: 18,
  },
  accountLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 4,
  },
});
