import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#a78bfa', // calm-500
      tabBarInactiveTintColor: '#9ca3af', // gray-400
      tabBarStyle: {
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        height: 60,
        paddingBottom: 10,
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: '分析',
          tabBarIcon: ({ color }) => <Feather name="pie-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: '行動',
          tabBarIcon: ({ color }) => <Feather name="activity" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
