import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { useRoom } from '@/contexts/RoomContext';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, pauseTrack, skipTrack } = useMusic();
  const { currentRoom } = useRoom();
  const animation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Slide in animation
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  
  const handlePress = () => {
    if (currentRoom) {
      router.push(`/room/${currentRoom.id}`);
    }
  };
  
  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  };
  
  const handleSkip = (e) => {
    e.stopPropagation();
    skipTrack();
  };
  
  if (!currentTrack) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }], bottom: 80 + (Platform.OS === 'ios' ? insets.bottom : 0) }
      ]}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      
      <TouchableOpacity style={styles.content} onPress={handlePress} activeOpacity={0.8}>
        {currentTrack.albumArt ? (
          <Image source={{ uri: currentTrack.albumArt }} style={styles.albumArt} />
        ) : (
          <View style={styles.albumArtPlaceholder} />
        )}
        
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={24} color="#ffffff" />
            ) : (
              <Play size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={handleSkip}>
            <SkipForward size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(38, 38, 38, 0.4)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  albumArtPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#555555',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
  },
  artistName: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#a0a0a0',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});