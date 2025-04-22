import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Music } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithSpotify, signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSpotifyLogin = async () => {
    setLoading(true);
    try {
      await signInWithSpotify();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Spotify login error:', error);
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Anonymous login error:', error);
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#121212', '#262626', '#121212']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Music size={64} color="#6C63FF" />
        <Text style={styles.title}>SoundSync</Text>
        <Text style={styles.subtitle}>Location-based music sharing</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.spotifyButton}
          onPress={handleSpotifyLogin}
          disabled={loading}
        >
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png' }}
            style={styles.spotifyIcon}
          />
          <Text style={styles.spotifyButtonText}>
            {loading ? 'Connecting...' : 'Login with Spotify'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.anonymousButton}
          onPress={handleAnonymousLogin}
          disabled={loading}
        >
          <Text style={styles.anonymousButtonText}>
            Continue as Listener
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    color: '#ffffff',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  spotifyButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spotifyIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  spotifyButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    fontSize: 16,
  },
  anonymousButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  anonymousButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
  },
});