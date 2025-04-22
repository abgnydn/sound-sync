
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoom } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic, type TrackType } from '@/contexts/MusicContext';
import { Search, X, Play, Pause, Radio, MoreVertical } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { createRoom } = useRoom();
  const { 
    searchTracks, 
    searchResults, 
    isSearching,
    currentTrack,
    playTrack,
    pauseTrack,
    isPlaying
  } = useMusic();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    if (!user?.spotifyToken) {
      // Redirect non-Spotify users who can't be DJs
      router.replace('/(tabs)');
    }
  }, [user]);
  
  useEffect(() => {
    if (user?.displayName) {
      setRoomName(`${user.displayName}'s Room`);
    }
  }, [user]);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      searchTracks(text);
    }
  };
  
  const handleSelectTrack = (track: TrackType) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    playTrack(track);
  };
  
  const handleCreateRoom = async () => {
    if (!currentTrack || !roomName) return;
    
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsCreating(true);
    try {
      const roomId = await createRoom(roomName, currentTrack);
      router.push(`/room/${roomId}?isDj=true`);
    } catch (error) {
      console.error('Error creating room:', error);
      setIsCreating(false);
    }
  };
  
  if (!user?.spotifyToken) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>
          You must connect with Spotify to become a DJ
        </Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Create Room</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.roomSetup}>
          <Text style={styles.sectionTitle}>Room Setup</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Room Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room name"
              placeholderTextColor="#666666"
              value={roomName}
              onChangeText={setRoomName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Track</Text>
            {currentTrack ? (
              <View style={styles.selectedTrack}>
                <Image 
                  source={{ uri: currentTrack.albumArt }} 
                  style={styles.selectedTrackImage} 
                />
                <View style={styles.selectedTrackInfo}>
                  <Text style={styles.selectedTrackName} numberOfLines={1}>
                    {currentTrack.name}
                  </Text>
                  <Text style={styles.selectedTrackArtist} numberOfLines={1}>
                    {currentTrack.artist}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={isPlaying ? pauseTrack : () => playTrack(currentTrack)}
                >
                  {isPlaying ? (
                    <Pause size={20} color="#ffffff" />
                  ) : (
                    <Play size={20} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noTrackText}>
                Search and select a track below
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <Text style={styles.sectionTitle}>Track Search</Text>
          
          <View style={styles.searchBar}>
            <Search size={20} color="#a0a0a0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for tracks..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <X size={16} color="#a0a0a0" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.searchResults}>
            {isSearching ? (
              <ActivityIndicator color="#6C63FF" style={styles.loading} />
            ) : searchResults.length > 0 ? (
              searchResults.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackItem}
                  onPress={() => handleSelectTrack(track)}
                >
                  <Image 
                    source={{ uri: track.albumArt }} 
                    style={styles.trackImage} 
                  />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName} numberOfLines={1}>
                      {track.name}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.trackAction}>
                    <Play size={18} color="#ffffff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : searchQuery.length > 2 ? (
              <Text style={styles.noResultsText}>
                No tracks found for "{searchQuery}"
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!currentTrack || !roomName || isCreating) && styles.createButtonDisabled
          ]}
          onPress={handleCreateRoom}
          disabled={!currentTrack || !roomName || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Radio size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Create Room</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  roomSetup: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  selectedTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedTrackImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  selectedTrackInfo: {
    flex: 1,
  },
  selectedTrackName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedTrackArtist: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#a0a0a0',
  },
  playPauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTrackText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    minHeight: 100,
  },
  loading: {
    marginTop: 24,
  },
  trackItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  trackImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  trackArtist: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#a0a0a0',
  },
  trackAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  createButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(108, 99, 255, 0.4)',
  },
  createButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 40,
  },
});