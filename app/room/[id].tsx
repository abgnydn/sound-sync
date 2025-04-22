import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Platform 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoom } from '@/contexts/RoomContext';
import { useMusic } from '@/contexts/MusicContext';
import { 
  ThumbsUp, 
  ThumbsDown, 
  ChevronLeft, 
  Users, 
  MoreVertical,
  Play,
  SkipForward,
  PauseCircle
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function RoomScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, isDj } = useLocalSearchParams();
  const roomId = id as string;
  const isDjMode = isDj === 'true';
  
  const { getRoom, leaveRoom, voteSkip } = useRoom();
  const { isPlaying, pauseTrack, playTrack, skipTrack } = useMusic();
  
  const [room, setRoom] = useState(null);
  const [voteTimer, setVoteTimer] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    const roomData = getRoom(roomId);
    if (roomData) {
      setRoom(roomData);
    } else {
      // Room not found, navigate back
      router.back();
    }
    
    // Start vote timer animation
    const interval = setInterval(() => {
      setVoteTimer(prev => {
        if (prev < 10) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      leaveRoom(roomId);
    };
  }, [roomId]);
  
  useEffect(() => {
    // Animate album art
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 15000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const handleVote = (isUpvote: boolean) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        isUpvote 
          ? Haptics.ImpactFeedbackStyle.Light 
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    
    setHasVoted(true);
    voteSkip(roomId, !isUpvote);
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else if (room?.currentTrack) {
      playTrack(room.currentTrack);
    }
  };
  
  const handleSkip = () => {
    skipTrack();
  };
  
  if (!room) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>DJ: {room.hostName}</Text>
            {room.badVotes > 0 && (
              <View style={styles.badVotesContainer}>
                <Text style={styles.badVotesText}>
                  {room.badVotes}/{Math.ceil(room.listeners / 2)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.listenersContainer}>
          <Users size={16} color="#ffffff" />
          <Text style={styles.listenersCount}>{room.listeners}</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.albumContainer,
            { transform: [{ rotate: rotation }] }
          ]}
        >
          {room.currentTrack?.albumArt ? (
            <Image 
              source={{ uri: room.currentTrack.albumArt }} 
              style={styles.albumArt} 
            />
          ) : (
            <View style={styles.albumArtPlaceholder} />
          )}
          <View style={styles.albumCenter} />
        </Animated.View>
        
        <View style={styles.trackInfo}>
          <Text style={styles.trackName}>
            {room.currentTrack?.name || 'No track playing'}
          </Text>
          <Text style={styles.artistName}>
            {room.currentTrack?.artist || 'Unknown Artist'}
          </Text>
        </View>
        
        {isDjMode ? (
          <View style={styles.djControls}>
            <TouchableOpacity 
              style={styles.djControlButton}
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <PauseCircle size={60} color="#ffffff" />
              ) : (
                <Play size={60} color="#ffffff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.djControlButton}
              onPress={handleSkip}
            >
              <SkipForward size={60} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.voteContainer}>
            <Text style={styles.voteTitle}>
              Like this track?
            </Text>
            <View style={styles.voteButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.voteButton, 
                  styles.upvoteButton,
                  hasVoted && styles.voteButtonDisabled
                ]} 
                onPress={() => handleVote(true)}
                disabled={hasVoted}
              >
                <ThumbsUp 
                  size={24} 
                  color={hasVoted ? 'rgba(255, 255, 255, 0.4)' : '#ffffff'} 
                />
              </TouchableOpacity>
              <View style={styles.voteTimerContainer}>
                <Text style={styles.voteTimerText}>
                  {Math.max(0, 10 - voteTimer)}s
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.voteButton, 
                  styles.downvoteButton,
                  hasVoted && styles.voteButtonDisabled
                ]} 
                onPress={() => handleVote(false)}
                disabled={hasVoted}
              >
                <ThumbsDown 
                  size={24} 
                  color={hasVoted ? 'rgba(255, 255, 255, 0.4)' : '#ffffff'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}
      >
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#ffffff" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e0e0e0',
  },
  badVotesContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badVotesText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FF3B30',
  },
  listenersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  listenersCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  albumContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  albumArt: {
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  albumArtPlaceholder: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#555555',
  },
  albumCenter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#121212',
    borderWidth: 2,
    borderColor: '#666666',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  trackName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  voteContainer: {
    alignItems: 'center',
    width: '100%',
  },
  voteTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  voteButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvoteButton: {
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
    borderWidth: 2,
    borderColor: '#4CD964',
  },
  downvoteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteTimerContainer: {
    width: 40,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  voteTimerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  djControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  djControlButton: {
    marginHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'flex-end',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});