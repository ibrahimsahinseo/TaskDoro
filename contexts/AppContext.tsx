import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors, ThemeColors } from '../constants/theme';
import { getTranslations, Language, Translations } from '../constants/i18n';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  pomodorosTarget: number;
  pomodorosCompleted: number;
  createdAt: string;
  category: string;
  color: string;
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes: number;
  tags: string[];
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  icon: string;
  target: string;
  milestonesTotal: number;
  milestonesCompleted: number;
  status: 'in_progress' | 'on_track' | 'completed';
  color: 'primary' | 'tertiary' | 'secondary';
}

export interface FocusSession {
  id: string;
  taskId?: string;
  type: 'focus' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: string;
  date: string;
  name?: string;
  tag?: string;
  color?: string;
}

export interface ScheduleBlock {
  id: string;
  type: 'focus' | 'shortBreak' | 'longBreak';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface PlannedSession {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  tag: string;
  color: string;
}

export interface AchievementDef {
  id: string;
  icon: string;
  threshold?: number;
}

export interface AppState {
  settings: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    autoStartNext: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    darkTheme: boolean;
    backgroundTheme: string;
    ambientSound: string | null;
    ambientVolume: number;
    language: Language;
  };
  tasks: Task[];
  goals: Goal[];
  sessions: FocusSession[];
  schedule: ScheduleBlock[];
  plannedSessions: PlannedSession[];
  profile: {
    name: string;
    title: string;
    totalFocusMinutes: number;
    totalSessions: number;
    totalTasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    xp: number;
    level: number;
    dailyRewardClaimed: boolean;
    achievements: string[];
  };
  timer: {
    currentCycle: number;
    totalCyclesCompleted: number;
    todayPomodoros: number;
    dailyTarget: number;
    weeklyFocusMinutes: number;
    weeklyGoalMinutes: number;
    todayFocusMinutes: number;
  };
}

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_SESSION'; payload: FocusSession }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<Goal> } }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_TIMER'; payload: Partial<AppState['timer']> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AppState['profile']> }
  | { type: 'ADD_SCHEDULE_BLOCK'; payload: ScheduleBlock }
  | { type: 'UPDATE_SCHEDULE_BLOCK'; payload: { id: string; updates: Partial<ScheduleBlock> } }
  | { type: 'DELETE_SCHEDULE_BLOCK'; payload: string }
  | { type: 'ADD_PLANNED_SESSION'; payload: PlannedSession }
  | { type: 'DELETE_PLANNED_SESSION'; payload: string }
  | { type: 'CLAIM_DAILY_REWARD' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'CHECK_STREAK' };

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 50;
}

export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1);
}

const initialState: AppState = {
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartNext: false,
    soundEnabled: true,
    vibrationEnabled: false,
    darkTheme: true,
    backgroundTheme: 'default',
    ambientSound: null,
    ambientVolume: 0.5,
    language: 'en',
  },
  tasks: [
    { id: '1', title: 'Complete System Architecture Doc', completed: false, priority: 'high', pomodorosTarget: 3, pomodorosCompleted: 0, createdAt: new Date().toISOString(), category: 'work', color: '#FF6B6B', dueDate: new Date().toISOString().split('T')[0], estimatedMinutes: 75, tags: ['coding', 'urgent'] },
    { id: '2', title: 'Review Pull Requests', completed: false, priority: 'medium', pomodorosTarget: 2, pomodorosCompleted: 0, createdAt: new Date().toISOString(), category: 'work', color: '#4ECDC4', estimatedMinutes: 50, tags: ['coding'] },
    { id: '3', title: 'Daily Standup Notes', completed: true, priority: 'low', pomodorosTarget: 1, pomodorosCompleted: 1, createdAt: new Date().toISOString(), category: 'meeting', color: '#45B7D1', estimatedMinutes: 25, tags: ['meeting'] },
  ],
  goals: [
    { id: '1', title: 'Master React Native', icon: 'code', target: 'Q3 2024', milestonesTotal: 5, milestonesCompleted: 3, status: 'in_progress', color: 'primary' },
    { id: '2', title: 'Read 24 Books', icon: 'menu_book', target: 'End of Year', milestonesTotal: 24, milestonesCompleted: 10, status: 'on_track', color: 'tertiary' },
  ],
  sessions: [],
  schedule: [
    { id: '1', type: 'focus', title: 'Frontend Architecture', description: 'Draft initial component structure for new UI.', startTime: '09:00', endTime: '10:30', dayOfWeek: 1 },
    { id: '2', type: 'shortBreak', title: 'Short Break', description: '', startTime: '10:30', endTime: '10:45', dayOfWeek: 1 },
    { id: '3', type: 'focus', title: 'API Integration', description: 'Connect frontend forms to backend endpoints.', startTime: '10:45', endTime: '12:15', dayOfWeek: 1 },
  ],
  plannedSessions: [],
  profile: {
    name: 'Alex Mercer',
    title: 'Software Engineer | Focused on building tools for thought.',
    totalFocusMinutes: 25200,
    totalSessions: 420,
    totalTasksCompleted: 85,
    currentStreak: 14,
    longestStreak: 21,
    lastActiveDate: new Date().toISOString().split('T')[0],
    xp: 4200,
    level: 10,
    dailyRewardClaimed: false,
    achievements: ['first_session', 'ten_sessions', 'fifty_sessions', 'hundred_sessions', 'one_hour', 'week_streak', 'early_bird', 'perfect_day'],
  },
  timer: {
    currentCycle: 1,
    totalCyclesCompleted: 0,
    todayPomodoros: 3,
    dailyTarget: 8,
    weeklyFocusMinutes: 1920,
    weeklyGoalMinutes: 2400,
    todayFocusMinutes: 75,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map((t) => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'TOGGLE_TASK': {
      const task = state.tasks.find((t) => t.id === action.payload);
      const willComplete = task && !task.completed;
      return {
        ...state,
        tasks: state.tasks.map((t) => t.id === action.payload ? { ...t, completed: !t.completed } : t),
        profile: willComplete ? { ...state.profile, totalTasksCompleted: state.profile.totalTasksCompleted + 1 } : state.profile,
      };
    }
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map((g) => g.id === action.payload.id ? { ...g, ...action.payload.updates } : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'UPDATE_TIMER':
      return { ...state, timer: { ...state.timer, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_SCHEDULE_BLOCK':
      return { ...state, schedule: [...state.schedule, action.payload] };
    case 'UPDATE_SCHEDULE_BLOCK':
      return { ...state, schedule: state.schedule.map((s) => s.id === action.payload.id ? { ...s, ...action.payload.updates } : s) };
    case 'DELETE_SCHEDULE_BLOCK':
      return { ...state, schedule: state.schedule.filter((s) => s.id !== action.payload) };
    case 'ADD_PLANNED_SESSION':
      return { ...state, plannedSessions: [...state.plannedSessions, action.payload] };
    case 'DELETE_PLANNED_SESSION':
      return { ...state, plannedSessions: state.plannedSessions.filter((s) => s.id !== action.payload) };
    case 'CLAIM_DAILY_REWARD': {
      const bonusXp = 50 + (state.profile.currentStreak * 10);
      const newXp = state.profile.xp + bonusXp;
      return { ...state, profile: { ...state.profile, dailyRewardClaimed: true, xp: newXp, level: calculateLevel(newXp) } };
    }
    case 'ADD_XP': {
      const newXp = state.profile.xp + action.payload;
      return { ...state, profile: { ...state.profile, xp: newXp, level: calculateLevel(newXp) } };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      if (state.profile.achievements.includes(action.payload)) return state;
      return { ...state, profile: { ...state.profile, achievements: [...state.profile.achievements, action.payload] } };
    }
    case 'CHECK_STREAK': {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (state.profile.lastActiveDate === today) return state;
      if (state.profile.lastActiveDate === yesterday) {
        const newStreak = state.profile.currentStreak + 1;
        return { ...state, profile: { ...state.profile, currentStreak: newStreak, longestStreak: Math.max(state.profile.longestStreak, newStreak), lastActiveDate: today, dailyRewardClaimed: false } };
      }
      return { ...state, profile: { ...state.profile, currentStreak: 1, lastActiveDate: today, dailyRewardClaimed: false } };
    }
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({ state: initialState, dispatch: () => {} });
const STORAGE_KEY = '@taskdoro_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({
            type: 'SET_STATE',
            payload: {
              ...initialState,
              ...parsed,
              settings: { ...initialState.settings, ...parsed.settings },
              profile: { ...initialState.profile, ...parsed.profile },
              timer: { ...initialState.timer, ...parsed.timer },
            },
          });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    dispatch({ type: 'CHECK_STREAK' });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }

export function useThemeColors(): ThemeColors {
  const { state } = useContext(AppContext);
  return useMemo(() => getThemeColors(state.settings.darkTheme), [state.settings.darkTheme]);
}

export function useTranslation(): Translations {
  const { state } = useContext(AppContext);
  return useMemo(() => getTranslations(state.settings.language), [state.settings.language]);
}

export { initialState, calculateLevel, xpForLevel };
