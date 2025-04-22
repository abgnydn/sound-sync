import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Bluetooth, 
  Map, 
  Volume2, 
  Shield, 
  HelpCircle, 
  Info, 
  ChevronRight 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signInWithSpotify } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [audioQuality, setAudioQuality] = useState('High');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleSpotifyConnect = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {

      console.log('first')
      await signInWithSpotify();
      // No need to navigate, user object should update causing re-render
    } catch (error) { 
      console.error('Spotify connect error in settings:', error);
      // Optionally show an error message to the user here
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>User Type</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>
                {user?.isSpotifyConnected ? 'DJ / Listener' : 'Listener Only'}
              </Text>
            </View>
          </View>
          
          {!user?.isSpotifyConnected && (
            <TouchableOpacity 
              style={[styles.spotifyConnectButton, isConnecting && styles.spotifyConnectButtonDisabled]}
              onPress={handleSpotifyConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color="#ffffff" style={styles.activityIndicator} />
              ) : null}
              <Text style={styles.spotifyConnectText}>
                {isConnecting ? 'Connecting...' : 'Connect Spotify to Become a DJ'}
              </Text>
              {!isConnecting && <ChevronRight size={16} color="#ffffff" />}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Bell size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#3e3e3e', true: '#6C63FF' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Map size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#3e3e3e', true: '#6C63FF' }}
              thumbColor={locationEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Bluetooth size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>Bluetooth Proximity</Text>
            </View>
            <Switch
              value={bluetoothEnabled}
              onValueChange={setBluetoothEnabled}
              trackColor={{ false: '#3e3e3e', true: '#6C63FF' }}
              thumbColor={bluetoothEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Volume2 size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>Audio Quality</Text>
            </View>
            <View style={styles.settingActionContainer}>
              <Text style={styles.settingActionText}>{audioQuality}</Text>
              <ChevronRight size={16} color="#a0a0a0" />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Shield size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={16} color="#a0a0a0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <HelpCircle size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>Help & Support</Text>
            </View>
            <ChevronRight size={16} color="#a0a0a0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Info size={20} color="#a0a0a0" />
              <Text style={styles.settingLabel}>About SoundSync</Text>
            </View>
            <ChevronRight size={16} color="#a0a0a0" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  settingValue: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  settingValueText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  settingActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingActionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#a0a0a0',
    marginRight: 8,
  },
  spotifyConnectButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  spotifyConnectButtonDisabled: {
    backgroundColor: '#1aa34a',
  },
  spotifyConnectText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    marginHorizontal: 8,
  },
  activityIndicator: {
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
  },
});