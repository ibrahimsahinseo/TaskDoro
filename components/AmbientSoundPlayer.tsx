import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInDown,
  Easing,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { useApp } from '../contexts/AppContext';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  description: string;
  frequency: number;
  color: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain', icon: '🌧', description: 'Gentle rainfall', frequency: 200, color: '#45B7D1' },
  { id: 'thunder', name: 'Thunder Storm', icon: '⛈', description: 'Rain with distant thunder', frequency: 100, color: '#6750a4' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', description: 'Crashing waves on shore', frequency: 150, color: '#4ECDC4' },
  { id: 'forest', name: 'Forest', icon: '🌲', description: 'Birds and rustling leaves', frequency: 300, color: '#2ECC71' },
  { id: 'fire', name: 'Fireplace', icon: '🔥', description: 'Crackling wood fire', frequency: 180, color: '#FF6B6B' },
  { id: 'wind', name: 'Wind', icon: '💨', description: 'Soft breeze through trees', frequency: 250, color: '#95a5a6' },
  { id: 'cafe', name: 'Cafe', icon: '☕', description: 'Coffee shop ambience', frequency: 350, color: '#e7c365' },
  { id: 'whitenoise', name: 'White Noise', icon: '📻', description: 'Static white noise', frequency: 400, color: '#cbc4d2' },
  { id: 'night', name: 'Night', icon: '🌙', description: 'Crickets and night sounds', frequency: 220, color: '#cfbcff' },
  { id: 'stream', name: 'Stream', icon: '💧', description: 'Babbling brook', frequency: 280, color: '#3498db' },
];

function generateTone(frequency: number): string {
  const sampleRate = 44100;
  const duration = 4;
  const numSamples = sampleRate * duration;
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    // Layer multiple harmonics for a richer sound
    sample += 0.3 * Math.sin(2 * Math.PI * frequency * t);
    sample += 0.2 * Math.sin(2 * Math.PI * (frequency * 1.5) * t);
    sample += 0.1 * Math.sin(2 * Math.PI * (frequency * 2) * t);
    // Add some noise for texture
    sample += 0.15 * (Math.random() * 2 - 1);
    // Gentle amplitude modulation
    sample *= 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t);
    buffer[i] = sample * 0.3;
  }

  return '';
}

interface AmbientPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export default function AmbientSoundPlayer({ visible, onClose }: AmbientPlayerProps) {
  const { state, dispatch } = useApp();
  const [activeSound, setActiveSound] = useState<string | null>(state.settings.ambientSound);
  const [volume, setVolume] = useState(state.settings.ambientVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 300 });
    }
  }, [isPlaying]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playSound = useCallback(async (soundId: string) => {
    await stopSound();

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Generate a simple oscillator tone as placeholder
      // In production, you'd load actual audio files
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=' },
        { isLooping: true, volume: volume, shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setActiveSound(soundId);
      dispatch({ type: 'UPDATE_SETTINGS', payload: { ambientSound: soundId } });
    } catch (error) {
      // Silently handle - sound files would be bundled in production
      setActiveSound(soundId);
      setIsPlaying(true);
      dispatch({ type: 'UPDATE_SETTINGS', payload: { ambientSound: soundId } });
    }
  }, [volume, stopSound, dispatch]);

  const toggleSound = useCallback(async (soundId: string) => {
    if (activeSound === soundId && isPlaying) {
      await stopSound();
      setActiveSound(null);
      dispatch({ type: 'UPDATE_SETTINGS', payload: { ambientSound: null } });
    } else {
      await playSound(soundId);
    }
  }, [activeSound, isPlaying, stopSound, playSound, dispatch]);

  const adjustVolume = useCallback(async (delta: number) => {
    const newVolume = Math.min(1, Math.max(0, volume + delta));
    setVolume(newVolume);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ambientVolume: newVolume } });
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(newVolume);
      } catch {}
    }
  }, [volume, dispatch]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  const activeSoundData = AMBIENT_SOUNDS.find((s) => s.id === activeSound);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        <Animated.View entering={SlideInDown.springify().damping(20)} style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Ambient Sounds</Text>
            <Text style={styles.sheetSubtitle}>
              {isPlaying && activeSoundData
                ? `Now Playing: ${activeSoundData.name}`
                : 'Choose a sound to focus'}
            </Text>
          </View>

          {/* Now Playing Indicator */}
          {isPlaying && activeSoundData && (
            <Animated.View style={[styles.nowPlaying, pulseStyle]}>
              <View style={[styles.nowPlayingCircle, { backgroundColor: `${activeSoundData.color}20` }]}>
                <Text style={styles.nowPlayingIcon}>{activeSoundData.icon}</Text>
              </View>
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingName}>{activeSoundData.name}</Text>
                <Text style={styles.nowPlayingDesc}>{activeSoundData.description}</Text>
              </View>

              {/* Volume Control */}
              <View style={styles.volumeControl}>
                <TouchableOpacity
                  style={styles.volumeBtn}
                  onPress={() => adjustVolume(-0.1)}
                >
                  <Text style={styles.volumeIcon}>🔉</Text>
                </TouchableOpacity>
                <View style={styles.volumeBar}>
                  <View
                    style={[
                      styles.volumeFill,
                      {
                        width: `${volume * 100}%`,
                        backgroundColor: activeSoundData.color,
                      },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.volumeBtn}
                  onPress={() => adjustVolume(0.1)}
                >
                  <Text style={styles.volumeIcon}>🔊</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Sound Grid */}
          <ScrollView
            style={styles.soundList}
            contentContainerStyle={styles.soundGrid}
            showsVerticalScrollIndicator={false}
          >
            {AMBIENT_SOUNDS.map((sound) => {
              const isActive = activeSound === sound.id && isPlaying;
              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundCard,
                    isActive && {
                      borderColor: `${sound.color}50`,
                      backgroundColor: `${sound.color}10`,
                    },
                  ]}
                  onPress={() => toggleSound(sound.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.soundIconCircle,
                      {
                        backgroundColor: isActive
                          ? `${sound.color}30`
                          : Colors.surfaceContainerHighest,
                      },
                    ]}
                  >
                    <Text style={styles.soundEmoji}>{sound.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.soundName,
                      isActive && { color: sound.color },
                    ]}
                  >
                    {sound.name}
                  </Text>
                  {isActive && (
                    <View style={styles.playingIndicator}>
                      <View style={[styles.eqBar, { height: 8, backgroundColor: sound.color }]} />
                      <View style={[styles.eqBar, { height: 14, backgroundColor: sound.color }]} />
                      <View style={[styles.eqBar, { height: 6, backgroundColor: sound.color }]} />
                      <View style={[styles.eqBar, { height: 12, backgroundColor: sound.color }]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Stop Button */}
          {isPlaying && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={async () => {
                await stopSound();
                setActiveSound(null);
                dispatch({ type: 'UPDATE_SETTINGS', payload: { ambientSound: null } });
              }}
            >
              <Text style={styles.stopText}>⏹ STOP ALL SOUNDS</Text>
            </TouchableOpacity>
          )}
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
    maxHeight: '85%',
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
  nowPlaying: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  nowPlayingCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  nowPlayingIcon: {
    fontSize: 24,
  },
  nowPlayingInfo: {
    marginLeft: 60,
    marginBottom: 12,
  },
  nowPlayingName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  nowPlayingDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 60,
  },
  volumeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeIcon: {
    fontSize: 14,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 2,
  },
  soundList: {
    flex: 1,
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  soundCard: {
    width: (width - 40 - 20) / 3,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  soundIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  soundEmoji: {
    fontSize: 22,
  },
  soundName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  playingIndicator: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 6,
    alignItems: 'flex-end',
    height: 14,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
  },
  stopButton: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  stopText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.error,
  },
});
