import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoom, type Room } from '@/contexts/RoomContext';
import { Radio, Users, Music, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RoomsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { nearbyRooms, joinRoom, recentRooms } = useRoom();
  const [isSearching, setIsSearching] = useState(false);

  const handleJoinRoom = async (roomId: string) => {
    await joinRoom(roomId);
    router.push(`/room/${roomId}`);
  };

  const renderRoomItem = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => handleJoinRoom(item.id)}
    >
      <View style={styles.roomItemLeft}>
        {item.coverArt ? (
          <Image source={{ uri: item.coverArt }} style={styles.roomImage} />
        ) : (
          <View style={styles.roomImagePlaceholder}>
            <Music size={24} color="#6C63FF" />
          </View>
        )}
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomDetails}>
            {item.currentTrack?.name || 'No music playing'}
          </Text>
          <View style={styles.roomMeta}>
            <View style={styles.metaItem}>
              <Users size={12} color="#a0a0a0" />
              <Text style={styles.metaText}>{item.listeners}</Text>
            </View>
            <View style={styles.metaItem}>
              <Radio size={12} color="#a0a0a0" />
              <Text style={styles.metaText}>{item.distance}m</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => handleJoinRoom(item.id)}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rooms</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setIsSearching(!isSearching)}
        >
          <Search size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      {isSearching ? (
        <View style={styles.searchContainer}>
          {/* Search implementation would go here */}
          <Text style={styles.emptyText}>Search functionality coming soon</Text>
        </View>
      ) : (
        <FlatList
          data={nearbyRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <>
              <Text style={styles.sectionTitle}>Nearby Rooms</Text>
              {nearbyRooms.length === 0 && (
                <Text style={styles.emptyText}>No nearby rooms found</Text>
              )}
            </>
          )}
          ListFooterComponent={() => (
            <>
              <Text style={styles.sectionTitle}>Recently Visited</Text>
              {recentRooms.length === 0 ? (
                <Text style={styles.emptyText}>No recently visited rooms</Text>
              ) : (
                <FlatList
                  data={recentRooms}
                  keyExtractor={(item) => item.id}
                  renderItem={renderRoomItem}
                  scrollEnabled={false}
                />
              )}
            </>
          )}
        />
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(18, 18, 18, 0.8)', '#121212']}
        style={[styles.gradient, { height: 100 + insets.bottom }]}
      />
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
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    marginTop: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#a0a0a0',
    alignSelf: 'center',
    marginVertical: 20,
  },
  roomItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  roomImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  roomDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 6,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#a0a0a0',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    fontSize: 14,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});