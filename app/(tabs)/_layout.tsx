import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { Map, Music, Settings, Radio, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '@/components/MiniPlayer';
import { useMusic } from '@/contexts/MusicContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { currentTrack } = useMusic();
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            borderTopWidth: 0,
            position: 'absolute',
            height: 80 + (Platform.OS === 'ios' ? insets.bottom : 0),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
            paddingTop: 12,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#888888',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Regular',
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="rooms"
          options={{
            title: 'Rooms',
            tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'DJ Mode',
            tabBarIcon: ({ color, size }) => <Music size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      
      {currentTrack && <MiniPlayer />}
    </View>
  );
}