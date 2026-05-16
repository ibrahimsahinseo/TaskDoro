import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { useApp, useThemeColors, useTranslation } from '../contexts/AppContext';
import { Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

interface Theme {
  id: string;
  name: string;
  icon: string;
  gradient: string[];
  preview: string;
}

interface BackgroundThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function BackgroundThemeSelector({ visible, onClose }: BackgroundThemeSelectorProps) {
  const { state, dispatch } = useApp();
  const c = useThemeColors();
  const t = useTranslation();
  const currentTheme = state.settings.backgroundTheme;

  const BACKGROUND_THEMES: Theme[] = [
    { id: 'default', name: t.deepSpace, icon: '🌌', gradient: ['#141218', '#1A1A2E'], preview: '#141218' },
    { id: 'midnight', name: t.midnightBlue, icon: '🌙', gradient: ['#0a1628', '#1a2744'], preview: '#0a1628' },
    { id: 'aurora', name: t.aurora, icon: '🌈', gradient: ['#0d1117', '#161b22'], preview: '#0d1117' },
    { id: 'forest', name: t.darkForest, icon: '🌲', gradient: ['#0b1a0b', '#142014'], preview: '#0b1a0b' },
    { id: 'ocean', name: t.deepOcean, icon: '🌊', gradient: ['#0a192f', '#112240'], preview: '#0a192f' },
    { id: 'sunset', name: t.sunsetGlow, icon: '🌅', gradient: ['#1a0a1e', '#2d1133'], preview: '#1a0a1e' },
    { id: 'volcanic', name: t.volcanic, icon: '🌋', gradient: ['#1a0a0a', '#2d1414'], preview: '#1a0a0a' },
    { id: 'arctic', name: t.arctic, icon: '❄️', gradient: ['#0a1520', '#132030'], preview: '#0a1520' },
  ];

  const selectTheme = (themeId: string) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { backgroundTheme: themeId } });
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        <Animated.View entering={SlideInDown.springify().damping(20)} style={[styles.sheet, { backgroundColor: c.surfaceContainerLow }]}>
          <View style={[styles.handleBar, { backgroundColor: c.outlineVariant }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: c.onSurface }]}>{t.backgroundTheme}</Text>
            <Text style={[styles.sheetSubtitle, { color: c.onSurfaceVariant }]}>{t.customizeEnvironment}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.themeGrid} showsVerticalScrollIndicator={false}>
            {BACKGROUND_THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <TouchableOpacity key={theme.id} style={[styles.themeCard, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant + '20' }, isActive && { borderColor: `${c.primary}60`, borderWidth: 2 }]} onPress={() => selectTheme(theme.id)} activeOpacity={0.7}>
                  <View style={[styles.themePreview, { backgroundColor: theme.preview }]}>
                    <Text style={styles.themeEmoji}>{theme.icon}</Text>
                    {isActive && (
                      <View style={[styles.checkBadge, { backgroundColor: c.primary }]}>
                        <Text style={[styles.checkText, { color: c.onPrimary }]}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.themeName, { color: c.onSurfaceVariant }, isActive && { color: c.primary }]}>{theme.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={[styles.applyButton, { backgroundColor: c.primary }]} onPress={onClose}>
            <Text style={[styles.applyText, { color: c.onPrimary }]}>{t.applyTheme}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  overlayTouch: { flex: 1 },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Spacing.safeMargin, paddingBottom: 40, maxHeight: '80%' },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  sheetHeader: { marginBottom: Spacing.md },
  sheetTitle: { fontSize: 24, fontWeight: '700' },
  sheetSubtitle: { fontSize: 14, marginTop: 4 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 20 },
  themeCard: { width: (width - 40 - 24) / 2, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1 },
  themePreview: { height: 80, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  themeEmoji: { fontSize: 32 },
  checkBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 14, fontWeight: '700' },
  themeName: { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 10 },
  applyButton: { borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center' },
  applyText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
