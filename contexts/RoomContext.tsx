import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { database } from '@/config/firebase';
import { useAuth } from './AuthContext';
import { useBLE } from '@/hooks/useBLE';
import { Platform } from 'react-native';
import { TrackType } from './MusicContext';
import { generateRoomId } from '@/utils/helpers';

export type Location = {
  latitude: number;
  longitude: number;
};

export type Room = {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  location: Location;
  listeners: number;
  currentTrack: TrackType | null;
  badVotes: number;
  createdAt: number;
  distance?: number;
  coverArt?: string;
};

type HistoryRoom = {
  id: string;
  name: string;
  hostName: string;
  listeners: number;
  date: string;
};

type RoomContextType = {
  nearbyRooms: Room[];
  currentRoom: Room | null;
  recentRooms: Room[];
  hostHistory: HistoryRoom[];
  fetchNearbyRooms: (location: Location) => void;
  createRoom: (name: string, track: TrackType) => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => void;
  voteSkip: (roomId: string, isBadVote: boolean) => void;
  getRoom: (roomId: string) => Room | null;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

// Mock data for demo purposes
const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    name: "Emma's Jazz Room",
    hostId: 'user1',
    hostName: 'Emma',
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    listeners: 8,
    currentTrack: {
      id: 'track1',
      name: 'Autumn Leaves',
      artist: 'Bill Evans',
      albumArt: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      uri: 'spotify:track:1'
    },
    badVotes: 1,
    createdAt: Date.now(),
    distance: 120,
  },
  {
    id: '2',
    name: "Michael's Hip Hop Zone",
    hostId: 'user2',
    hostName: 'Michael',
    location: {
      latitude: 37.78925,
      longitude: -122.4334,
    },
    listeners: 12,
    currentTrack: {
      id: 'track2',
      name: '90s Hip Hop Mix',
      artist: 'Various Artists',
      albumArt: 'https://images.pexels.com/photos/2479312/pexels-photo-2479312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      uri: 'spotify:track:2'
    },
    badVotes: 0,
    createdAt: Date.now(),
    distance: 85,
  },
  {
    id: '3',
    name: "Chill Vibes Only",
    hostId: 'user3',
    hostName: 'Sophia',
    location: {
      latitude: 37.78725,
      longitude: -122.4314,
    },
    listeners: 5,
    currentTrack: {
      id: 'track3',
      name: 'Lofi Study Beats',
      artist: 'ChillHop',
      albumArt: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      uri: 'spotify:track:3'
    },
    badVotes: 0,
    createdAt: Date.now(),
    distance: 200,
  },
];

const MOCK_HISTORY: HistoryRoom[] = [
  {
    id: '4',
    name: "Weekend Dance Party",
    hostName: 'You',
    listeners: 23,
    date: 'Yesterday',
  },
  {
    id: '5',
    name: "Workout Motivation",
    hostName: 'You',
    listeners: 7,
    date: 'Last week',
  },
];

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { scanForPeripherals } = useBLE();
  
  const [nearbyRooms, setNearbyRooms] = useState<Room[]>(MOCK_ROOMS);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [recentRooms, setRecentRooms] = useState<Room[]>(MOCK_ROOMS.slice(0, 2));
  const [hostHistory, setHostHistory] = useState<HistoryRoom[]>(MOCK_HISTORY);

  // Fetch nearby rooms based on location
  const fetchNearbyRooms = (location: Location) => {
    // In a real app, this would query Firebase based on GeoHash
    // Here we use mock data with simulated distance
    
    // Start BLE scanning if on native platform
    if (Platform.OS !== 'web') {
      scanForPeripherals();
    }
    
    // Mock implementation with mock data
    setNearbyRooms(
      MOCK_ROOMS.map(room => ({
        ...room,
        distance: Math.floor(Math.random() * 200) + 50,
      }))
    );
  };

  // Create a new room
  const createRoom = async (name: string, track: TrackType): Promise<string> => {
    if (!user) throw new Error('User must be authenticated to create a room');
    
    const roomId = generateRoomId();
    const newRoom: Room = {
      id: roomId,
      name,
      hostId: user.id,
      hostName: user.displayName || 'Anonymous DJ',
      location: {
        latitude: 37.78825, // Mock location
        longitude: -122.4324,
      },
      listeners: 1, // Host is the first listener
      currentTrack: track,
      badVotes: 0,
      createdAt: Date.now(),
    };
    
    // In a real app, save to Firebase
    // await set(ref(database, `rooms/${roomId}`), newRoom);
    
    // For the mock implementation
    setNearbyRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom);
    
    // Add to host history
    const historyItem: HistoryRoom = {
      id: roomId,
      name,
      hostName: 'You',
      listeners: 1,
      date: 'Just now',
    };
    setHostHistory(prev => [historyItem, ...prev]);
    
    return roomId;
  };

  // Join a room
  const joinRoom = async (roomId: string): Promise<void> => {
    const room = nearbyRooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');
    
    // Update room in Firebase
    // In a real app, increment listener count and add user to room
    
    // For mock implementation
    const updatedRoom = { ...room, listeners: room.listeners + 1 };
    setNearbyRooms(prev => 
      prev.map(r => r.id === roomId ? updatedRoom : r)
    );
    setCurrentRoom(updatedRoom);
    
    // Add to recent rooms
    if (!recentRooms.some(r => r.id === roomId)) {
      setRecentRooms(prev => [updatedRoom, ...prev].slice(0, 5));
    }
  };

  // Leave a room
  const leaveRoom = (roomId: string): void => {
    if (!currentRoom || currentRoom.id !== roomId) return;
    
    // In a real app, decrement listener count and remove user from room
    
    // For mock implementation
    const updatedRoom = { 
      ...currentRoom, 
      listeners: Math.max(1, currentRoom.listeners - 1) 
    };
    
    setNearbyRooms(prev => 
      prev.map(r => r.id === roomId ? updatedRoom : r)
    );
    setCurrentRoom(null);
  };

  // Vote to skip the current song
  const voteSkip = (roomId: string, isBadVote: boolean): void => {
    const room = nearbyRooms.find(r => r.id === roomId);
    if (!room) return;
    
    // In a real app, update vote count in Firebase
    
    // For mock implementation
    const updatedRoom = { 
      ...room, 
      badVotes: isBadVote ? room.badVotes + 1 : room.badVotes 
    };
    
    setNearbyRooms(prev => 
      prev.map(r => r.id === roomId ? updatedRoom : r)
    );
    
    if (currentRoom?.id === roomId) {
      setCurrentRoom(updatedRoom);
    }
    
    // Check if votes are enough to skip
    if (updatedRoom.badVotes >= Math.ceil(updatedRoom.listeners / 2)) {
      // In a real app, notify the DJ to skip
      console.log('Track has enough bad votes to skip!');
    }
  };

  // Get room by ID
  const getRoom = (roomId: string): Room | null => {
    return nearbyRooms.find(r => r.id === roomId) || null;
  };

  return (
    <RoomContext.Provider
      value={{
        nearbyRooms,
        currentRoom,
        recentRooms,
        hostHistory,
        fetchNearbyRooms,
        createRoom,
        joinRoom,
        leaveRoom,
        voteSkip,
        getRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};