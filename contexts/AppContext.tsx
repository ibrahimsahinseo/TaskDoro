import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  pomodorosTarget: number;
  pomodorosCompleted: number;
  createdAt: string;
  category?: string;
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
  };
  tasks: Task[];
  goals: Goal[];
  sessions: FocusSession[];
  schedule: ScheduleBlock[];
  profile: {
    name: string;
    title: string;
    totalFocusMinutes: number;
    currentStreak: number;
    longestStreak: number;
    achievements: string[];
  };
  timer: {
    currentCycle: number;
    totalCyclesCompleted: number;
    todayPomodoros: number;
    dailyTarget: number;
    weeklyFocusMinutes: number;
    weeklyGoalMinutes: number;
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
  | { type: 'DELETE_SCHEDULE_BLOCK'; payload: string };

const initialState: AppState = {
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartNext: true,
    soundEnabled: true,
    vibrationEnabled: false,
    darkTheme: true,
    backgroundTheme: 'default',
    ambientSound: null,
    ambientVolume: 0.5,
  },
  tasks: [
    {
      id: '1',
      title: 'Complete System Architecture Doc',
      completed: false,
      priority: 'high',
      pomodorosTarget: 3,
      pomodorosCompleted: 0,
      createdAt: new Date().toISOString(),
      category: 'work',
    },
    {
      id: '2',
      title: 'Review Pull Requests',
      completed: false,
      priority: 'medium',
      pomodorosTarget: 2,
      pomodorosCompleted: 0,
      createdAt: new Date().toISOString(),
      category: 'work',
    },
    {
      id: '3',
      title: 'Daily Standup Notes',
      completed: true,
      priority: 'low',
      pomodorosTarget: 1,
      pomodorosCompleted: 1,
      createdAt: new Date().toISOString(),
      category: 'work',
    },
  ],
  goals: [
    {
      id: '1',
      title: 'Master React Native',
      icon: 'code',
      target: 'Q3 2024',
      milestonesTotal: 5,
      milestonesCompleted: 3,
      status: 'in_progress',
      color: 'primary',
    },
    {
      id: '2',
      title: 'Read 24 Books',
      icon: 'menu_book',
      target: 'End of Year',
      milestonesTotal: 24,
      milestonesCompleted: 10,
      status: 'on_track',
      color: 'tertiary',
    },
  ],
  sessions: [],
  schedule: [
    {
      id: '1',
      type: 'focus',
      title: 'Frontend Architecture',
      description: 'Draft initial component structure for new UI.',
      startTime: '09:00',
      endTime: '10:30',
      dayOfWeek: 1,
    },
    {
      id: '2',
      type: 'shortBreak',
      title: 'Short Break',
      description: '',
      startTime: '10:30',
      endTime: '10:45',
      dayOfWeek: 1,
    },
    {
      id: '3',
      type: 'focus',
      title: 'API Integration',
      description: 'Connect frontend forms to backend endpoints.',
      startTime: '10:45',
      endTime: '12:15',
      dayOfWeek: 1,
    },
  ],
  profile: {
    name: 'Alex Mercer',
    title: 'Software Engineer | Focused on building tools for thought.',
    totalFocusMinutes: 25200,
    currentStreak: 14,
    longestStreak: 21,
    achievements: ['fast_starter', '10k_minutes', 'night_owl'],
  },
  timer: {
    currentCycle: 1,
    totalCyclesCompleted: 0,
    todayPomodoros: 8,
    dailyTarget: 10,
    weeklyFocusMinutes: 1920,
    weeklyGoalMinutes: 2400,
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
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'UPDATE_TIMER':
      return { ...state, timer: { ...state.timer, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_SCHEDULE_BLOCK':
      return { ...state, schedule: [...state.schedule, action.payload] };
    case 'UPDATE_SCHEDULE_BLOCK':
      return {
        ...state,
        schedule: state.schedule.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };
    case 'DELETE_SCHEDULE_BLOCK':
      return { ...state, schedule: state.schedule.filter((s) => s.id !== action.payload) };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
});

const STORAGE_KEY = '@taskdoro_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: 'SET_STATE', payload: { ...initialState, ...parsed } });
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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export { initialState };
