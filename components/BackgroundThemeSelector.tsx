import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { useApp } from '../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

interface Theme {
  id: string;
  name: string;
  icon: string;
  gradient: string[];
  preview: string;
}

export const BACKGROUND_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Deep Space',
    icon: '🌌',
    gradient: ['#141218', '#1A1A2E'],
    preview: '#141218',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    icon: '🌙',
    gradient: ['#0a1628', '#1a2744'],
    preview: '#0a1628',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    icon: '🌈',
    gradient: ['#0d1117', '#161b22'],
    preview: '#0d1117',
  },
  {
    id: 'forest',
    name: 'Dark Forest',
    icon: '🌲',
    gradient: ['#0b1a0b', '#142014'],
    preview: '#0b1a0b',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    icon: '🌊',
    gradient: ['#0a192f', '#112240'],
    preview: '#0a192f',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    icon: '🌅',
    gradient: ['#1a0a1e', '#2d1133'],
    preview: '#1a0a1e',
  },
  {
    id: 'volcanic',
    name: 'Volcanic',
    icon: '🌋',
    gradient: ['#1a0a0a', '#2d1414'],
    preview: '#1a0a0a',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    icon: '❄️',
    gradient: ['#0a1520', '#132030'],
    preview: '#0a1520',
  },
];

interface BackgroundThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function BackgroundThemeSelector({
  visible,
  onClose,
}: BackgroundThemeSelectorProps) {
  const { state, dispatch } = useApp();
  const currentTheme = state.settings.backgroundTheme;

  const selectTheme = (themeId: string) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { backgroundTheme: themeId } });
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        <Animated.View entering={SlideInDown.springify().damping(20)} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Background Theme</Text>
            <Text style={styles.sheetSubtitle}>
              Customize your focus environment
            </Text>
          </View>

          {/* Theme Grid */}
          <ScrollView
            contentContainerStyle={styles.themeGrid}
            showsVerticalScrollIndicator={false}
          >
            {BACKGROUND_THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    isActive && styles.themeCardActive,
                  ]}
                  onPress={() => selectTheme(theme.id)}
                  activeOpacity={0.7}
                >
                  {/* Preview */}
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: theme.preview },
                    ]}
                  >
                    <Text style={styles.themeEmoji}>{theme.icon}</Text>
                    {isActive && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.themeName,
                      isActive && { color: Colors.primary },
                    ]}
                  >
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyText}>APPLY THEME</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surfaceContainerLow,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.safeMargin,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  sheetHeader: {
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  themeCard: {
    width: (width - 40 - 24) / 2,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  themeCardActive: {
    borderColor: `${Colors.primary}60`,
    borderWidth: 2,
  },
  themePreview: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  themeEmoji: {
    fontSize: 32,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 10,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onPrimary,
  },
});
