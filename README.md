# TaskDoro

A beautiful, offline-first Pomodoro timer and productivity app built with React Native & Expo.

## Features

- **Pomodoro Timer** - Full-featured focus timer with customizable durations, cycle tracking, and auto-progression
- **Task Management** - Create, complete, and track tasks with priority levels and pomodoro targets
- **Analytics Dashboard** - Visualize your focus patterns with weekly trends, donut charts, and activity heatmaps
- **Goals & Targets** - Set daily, weekly, and long-term goals with milestone tracking
- **Calendar & Planning** - Plan focus sessions and view scheduled events
- **Schedule Editor** - Design custom work/break routines with drag-and-drop blocks
- **Ambient Sounds** - 10 ambient soundscapes (rain, ocean, forest, fireplace, cafe, etc.)
- **Background Themes** - 8 dark themes (Deep Space, Midnight Blue, Aurora, Dark Forest, etc.)
- **Profile & Achievements** - Track total focus time, streaks, and unlock achievements
- **Offline-First** - All data stored locally with AsyncStorage, no internet required

## Tech Stack

- **React Native** with **Expo SDK 54**
- **Expo Router** for file-based navigation
- **React Native Reanimated** for smooth animations
- **React Native SVG** for progress rings and charts
- **AsyncStorage** for offline data persistence
- **Expo AV** for ambient sound playback
- **Expo Haptics** for tactile feedback

## Design System

Based on Material Design 3 dark theme with a "Deep Focus" philosophy:

- **Primary**: Purple/Lavender (#cfbcff)
- **Focus Mode**: Coral (#FF6B6B)
- **Short Break**: Mint (#4ECDC4)
- **Long Break**: Sea Blue (#45B7D1)
- **Typography**: Plus Jakarta Sans + JetBrains Mono

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Project Structure

```
TaskDoro/
  app/
    (tabs)/
      index.tsx      # Timer screen
      tasks.tsx      # Task management
      stats.tsx      # Analytics dashboard
      settings.tsx   # App settings
    goals.tsx        # Goals & targets
    profile.tsx      # User profile
    calendar.tsx     # Calendar view
    schedule.tsx     # Schedule editor
  components/
    AmbientSoundPlayer.tsx
    BackgroundThemeSelector.tsx
  constants/
    theme.ts         # Design tokens
  contexts/
    AppContext.tsx    # Global state management
```

## License

MIT
