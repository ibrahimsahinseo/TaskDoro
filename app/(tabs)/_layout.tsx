import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useThemeColors, useTranslation } from '../../contexts/AppContext';
import { Svg, Circle, Path, Rect, Line } from 'react-native-svg';

function TabIcon({ name, focused, colors }: { name: string; focused: boolean; colors: any }) {
  const stroke = focused ? colors.primary : colors.onSurfaceVariant;
  const fill = focused ? colors.primary : colors.onSurfaceVariant;
  const icons: Record<string, React.ReactNode> = {
    timer: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={13} r={8} stroke={stroke} strokeWidth={2} />
        <Path d="M12 9v4l2.5 2.5" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M10 2h4" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
    tasks: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={4} width={18} height={16} rx={3} stroke={stroke} strokeWidth={2} />
        <Path d="M8 10l2 2 4-4" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Line x1={8} y1={16} x2={16} y2={16} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
    stats: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={12} width={4} height={8} rx={1} fill={fill} opacity={focused ? 1 : 0.6} />
        <Rect x={10} y={6} width={4} height={14} rx={1} fill={fill} opacity={focused ? 1 : 0.6} />
        <Rect x={17} y={2} width={4} height={18} rx={1} fill={fill} opacity={focused ? 1 : 0.6} />
      </Svg>
    ),
    settings: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={3} stroke={stroke} strokeWidth={2} />
        <Path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  };
  return <>{icons[name]}</>;
}

export default function TabLayout() {
  const c = useThemeColors();
  const t = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: `${c.surfaceContainerLow}E6`,
          borderTopWidth: 1,
          borderTopColor: c.outlineVariant + '20',
          height: 80,
          paddingTop: 8,
          paddingBottom: 20,
          elevation: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginTop: 4,
        },
        tabBarItemStyle: { paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.timer,
          tabBarIcon: ({ focused }) => <TabIcon name="timer" focused={focused} colors={c} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t.tasks,
          tabBarIcon: ({ focused }) => <TabIcon name="tasks" focused={focused} colors={c} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t.stats,
          tabBarIcon: ({ focused }) => <TabIcon name="stats" focused={focused} colors={c} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} colors={c} />,
        }}
      />
    </Tabs>
  );
}
