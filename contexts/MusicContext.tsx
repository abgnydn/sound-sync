import React, { createContext, useState, useContext } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

export type TrackType = {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  uri: string;
};

type MusicContextType = {
  currentTrack: TrackType | null;
  isPlaying: boolean;
  isSearching: boolean;
  searchResults: TrackType[];
  searchTracks: (query: string) => void;
  playTrack: (track: TrackType) => void;
  pauseTrack: () => void;
  skipTrack: () => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Mock search results for demo
const MOCK_SEARCH_RESULTS: TrackType[] = [
  {
    id: 'track1',
    name: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    albumArt: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    uri: 'spotify:track:1'
  },
  {
    id: 'track2',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    albumArt: 'https://images.pexels.com/photos/2097616/pexels-photo-2097616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    uri: 'spotify:track:2'
  },
  {
    id: 'track3',
    name: 'Save Your Tears',
    artist: 'The Weeknd',
    albumArt: 'https://images.pexels.com/photos/1293374/pexels-photo-1293374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    uri: 'spotify:track:3'
  },
  {
    id: 'track4',
    name: 'After Hours',
    artist: 'The Weeknd',
    albumArt: 'https://images.pexels.com/photos/2123790/pexels-photo-2123790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    uri: 'spotify:track:4'
  },
  {
    id: 'track5',
    name: 'In Your Eyes',
    artist: 'The Weeknd',
    albumArt: 'https://images.pexels.com/photos/2118046/pexels-photo-2118046.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    uri: 'spotify:track:5'
  },
];

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [currentTrack, setCurrentTrack] = useState<TrackType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TrackType[]>([]);
  
  // Search for tracks
  const searchTracks = (query: string) => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      // Filter mock results based on query
      const results = MOCK_SEARCH_RESULTS.filter(
        track => 
          track.name.toLowerCase().includes(query.toLowerCase()) ||
          track.artist.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };
  
  // Play a track
  const playTrack = (track: TrackType) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // In a real app, this would use the Spotify SDK to play the track
    console.log(`Playing track: ${track.name}`);
  };
  
  // Pause the current track
  const pauseTrack = () => {
    setIsPlaying(false);
    
    // In a real app, this would use the Spotify SDK to pause
    console.log('Paused playback');
  };
  
  // Skip to the next track
  const skipTrack = () => {
    if (!currentTrack) return;
    
    // For demo purposes, we'll just pick a random track from the mock results
    const randomIndex = Math.floor(Math.random() * MOCK_SEARCH_RESULTS.length);
    const nextTrack = MOCK_SEARCH_RESULTS[randomIndex];
    
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    
    // In a real app, this would use the Spotify SDK to skip
    console.log(`Skipped to: ${nextTrack.name}`);
  };
  
  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isSearching,
        searchResults,
        searchTracks,
        playTrack,
        pauseTrack,
        skipTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};