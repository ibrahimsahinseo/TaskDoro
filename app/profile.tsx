import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation, xpForNextLevel } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const ACHIEVEMENT_DEFS: Record<string, { icon: string; labelKey: string; descKey: string }> = {
  first_session: { icon: '🎯', labelKey: 'achFirstSession', descKey: 'achFirstSessionDesc' },
  ten_sessions: { icon: '⭐', labelKey: 'achTenSessions', descKey: 'achTenSessionsDesc' },
  fifty_sessions: { icon: '💎', labelKey: 'achFiftySessions', descKey: 'achFiftySessionsDesc' },
  hundred_sessions: { icon: '👑', labelKey: 'achHundredSessions', descKey: 'achHundredSessionsDesc' },
  one_hour: { icon: '⏰', labelKey: 'achOneHour', descKey: 'achOneHourDesc' },
  five_hours: { icon: '🏃', labelKey: 'achFiveHours', descKey: 'achFiveHoursDesc' },
  week_streak: { icon: '🗓', labelKey: 'achWeekStreak', descKey: 'achWeekStreakDesc' },
  month_streak: { icon: '📅', labelKey: 'achMonthStreak', descKey: 'achMonthStreakDesc' },
  early_bird: { icon: '🐦', labelKey: 'achEarlyBird', descKey: 'achEarlyBirdDesc' },
  night_owl: { icon: '🦉', labelKey: 'achNightOwlAch', descKey: 'achNightOwlDesc' },
  task_master: { icon: '✅', labelKey: 'achTaskMaster', descKey: 'achTaskMasterDesc' },
  goal_getter: { icon: '🏆', labelKey: 'achGoalGetter', descKey: 'achGoalGetterDesc' },
  perfect_day: { icon: '💯', labelKey: 'achPerfectDay', descKey: 'achPerfectDayDesc' },
  level_10: { icon: '🌟', labelKey: 'achLevel10', descKey: 'achLevel10Desc' },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const { profile } = state;
  const totalHours = Math.floor(profile.totalFocusMinutes / 60);

  const xpCurrent = profile.xp;
  const xpPrev = (profile.level - 1) * (profile.level - 1) * 50;
  const xpNext = xpForNextLevel(profile.level);
  const xpProgress = xpNext > xpPrev ? (xpCurrent - xpPrev) / (xpNext - xpPrev) : 0;

  const dailyProgress = state.timer.todayPomodoros / state.timer.dailyTarget;
  const canClaimReward = dailyProgress >= 1 && !profile.dailyRewardClaimed;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editTitle, setEditTitle] = useState(profile.title);

  const handleSaveProfile = () => {
    if (editName.trim()) {
      dispatch({ type: 'UPDATE_PROFILE', payload: { name: editName.trim(), title: editTitle.trim() } });
    }
    setShowEditModal(false);
  };

  const allAchievementIds = Object.keys(ACHIEVEMENT_DEFS);
  const unlockedSet = new Set(profile.achievements);

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant + '20' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text style={[styles.backIcon, { color: c.onSurface }]}>←</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>{t.profileTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.profileCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: c.primaryContainer, borderColor: c.primary }]}>
            <Text style={[styles.avatarText, { color: c.onPrimaryContainer }]}>{profile.name.split(' ').map((n) => n[0]).join('')}</Text>
          </View>
          <Text style={[styles.profileName, { color: c.onSurface }]}>{profile.name}</Text>
          <Text style={[styles.profileTitle2, { color: c.onSurfaceVariant }]}>{profile.title}</Text>

          {/* Level & XP */}
          <View style={[styles.levelCard, { backgroundColor: `${c.primary}15` }]}>
            <View style={styles.levelRow}>
              <Text style={[styles.levelLabel, { color: c.primary }]}>{t.level} {profile.level}</Text>
              <Text style={[styles.xpLabel, { color: c.onSurfaceVariant }]}>{xpCurrent} {t.xpLabel}</Text>
            </View>
            <View style={[styles.xpBar, { backgroundColor: c.surfaceContainerHighest }]}>
              <View style={[styles.xpBarFill, { width: `${Math.min(xpProgress * 100, 100)}%`, backgroundColor: c.primary }]} />
            </View>
            <Text style={[styles.xpToNext, { color: c.onSurfaceVariant }]}>{t.xpToNext.replace('{xp}', String(xpNext - xpCurrent))}</Text>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: c.surfaceContainerHigh }]} onPress={() => { setEditName(profile.name); setEditTitle(profile.title); setShowEditModal(true); }}>
              <Text style={[styles.editButtonText, { color: c.onSurface }]}>✏ {t.editProfile}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, { borderColor: c.outlineVariant }]} onPress={() => Alert.alert(t.share)}>
              <Text style={[styles.shareButtonText, { color: c.onSurface }]}>↗ {t.share}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Daily Goal & Streak */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.streakCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <View style={styles.streakHeader}>
            <Text style={{ fontSize: 32 }}>🔥</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.streakTitle, { color: c.onSurface }]}>{t.dayStreak.replace('{count}', String(profile.currentStreak))}</Text>
              <Text style={[styles.streakSub, { color: c.onSurfaceVariant }]}>{profile.currentStreak >= 7 ? t.streakFire : t.streakKeepGoing}</Text>
            </View>
          </View>
          <View style={styles.dailyGoalRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dailyGoalLabel, { color: c.onSurfaceVariant }]}>{t.dailyGoal}: {state.timer.todayPomodoros}/{state.timer.dailyTarget}</Text>
              <View style={[styles.dailyBar, { backgroundColor: c.surfaceContainerHighest }]}>
                <View style={[styles.dailyBarFill, { width: `${Math.min(dailyProgress * 100, 100)}%`, backgroundColor: dailyProgress >= 1 ? c.mint : c.primary }]} />
              </View>
            </View>
            {canClaimReward ? (
              <TouchableOpacity style={[styles.claimBtn, { backgroundColor: c.tertiary }]} onPress={() => dispatch({ type: 'CLAIM_DAILY_REWARD' })}>
                <Text style={[styles.claimBtnText, { color: c.onTertiary }]}>🎁 {t.claimReward}</Text>
              </TouchableOpacity>
            ) : profile.dailyRewardClaimed ? (
              <View style={[styles.claimedBadge, { backgroundColor: `${c.mint}20` }]}>
                <Text style={[styles.claimedText, { color: c.mint }]}>✓ {t.rewardClaimed}</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* Stats Grid */}
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
            <View style={styles.statHeader}><Text style={[styles.statIcon, { color: c.secondary }]}>📊</Text><Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>SESSIONS</Text></View>
            <Text style={[styles.statValue, { color: c.onSurface }]}>{profile.totalSessions}</Text>
          </View>
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.achievementsCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>🏆 {t.achievements} ({profile.achievements.length}/{allAchievementIds.length})</Text>
          <View style={styles.achievementsGrid}>
            {allAchievementIds.map((achId) => {
              const def = ACHIEVEMENT_DEFS[achId];
              const unlocked = unlockedSet.has(achId);
              const label = (t as any)[def.labelKey] || def.labelKey;
              const desc = (t as any)[def.descKey] || def.descKey;
              return (
                <TouchableOpacity key={achId} style={[styles.achievementItem, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }, !unlocked && { opacity: 0.4 }]} onPress={() => Alert.alert(label, desc)}>
                  <View style={[styles.achievementIcon, { backgroundColor: unlocked ? `${c.tertiary}20` : c.surfaceVariant }]}>
                    <Text style={{ fontSize: 22 }}>{unlocked ? def.icon : '🔒'}</Text>
                  </View>
                  <Text style={[styles.achievementLabel, { color: c.onSurfaceVariant }]} numberOfLines={1}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.accountCard, { backgroundColor: c.surfaceContainerLow, borderColor: c.outlineVariant + '20' }]}>
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

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.cardBg, borderColor: c.outlineVariant + '20' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.onSurface }]}>✏ {t.editProfile}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>Name</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '30' }]} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={c.onSurfaceVariant + '60'} />
            <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>Bio / Title</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceContainer, color: c.onSurface, borderColor: c.outlineVariant + '30', minHeight: 60 }]} value={editTitle} onChangeText={setEditTitle} placeholder="Software Engineer | Building tools for thought." placeholderTextColor={c.onSurfaceVariant + '60'} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.surfaceContainer }]} onPress={() => setShowEditModal(false)}>
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.primary }]} onPress={handleSaveProfile}>
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 3, marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700' },
  profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  profileTitle2: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
  levelCard: { width: '100%', borderRadius: 12, padding: 12, marginBottom: 12 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelLabel: { fontSize: 16, fontWeight: '700' },
  xpLabel: { fontSize: 13, fontWeight: '600' },
  xpBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpToNext: { fontSize: 11, textAlign: 'right' },
  profileActions: { flexDirection: 'row', gap: 12, width: '100%' },
  editButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  editButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  shareButton: { flex: 1, borderWidth: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  shareButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  streakCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  streakHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  streakTitle: { fontSize: 20, fontWeight: '700' },
  streakSub: { fontSize: 13, marginTop: 2 },
  dailyGoalRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dailyGoalLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  dailyBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  dailyBarFill: { height: '100%', borderRadius: 4 },
  claimBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.full },
  claimBtnText: { fontSize: 12, fontWeight: '700' },
  claimedBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full },
  claimedText: { fontSize: 12, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  statCard: { flex: 1, minWidth: (width - 64) / 3, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statIcon: { fontSize: 16 },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  statValueLarge: { fontSize: 36, fontWeight: '700' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statUnit: { fontSize: 14, fontWeight: '400' },
  achievementsCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  sectionTitleSmall: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementItem: { alignItems: 'center', width: (width - 80) / 4, padding: 8, borderRadius: 12, borderWidth: 1 },
  achievementIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  achievementLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
  accountCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1 },
  accountItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, marginBottom: 8 },
  accountIcon: { fontSize: 18 },
  accountLabel: { fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginVertical: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  modalInput: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontWeight: '700' },
});
