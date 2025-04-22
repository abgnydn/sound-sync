import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { 
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { spotifyConfig } from '@/config/spotify';

WebBrowser.maybeCompleteAuthSession();

type User = {
  id: string;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  isSpotifyConnected: boolean;
  spotifyToken?: string;
  upvotes?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithSpotify: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Spotify Auth
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: spotifyConfig.clientId,
      scopes: spotifyConfig.scopes,
      usePKCE: false,
      redirectUri: makeRedirectUri({
        scheme: 'soundsync',
        path: 'spotify-auth-callback',
      }),
    },
    discovery
  );

  useEffect(() => {
    // Handle Spotify Auth response
    if (response?.type === 'success') {
      const { access_token } = response.params;
      
      // Fetch user profile from Spotify
      fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUser({
            id: data.id,
            displayName: data.display_name,
            photoURL: data.images?.[0]?.url || null,
            isAnonymous: false,
            isSpotifyConnected: true,
            spotifyToken: access_token,
            upvotes: 0,
          });
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching Spotify profile:', error);
          setIsLoading(false);
        });
    }
  }, [response]);

  useEffect(() => {
    // Initialize authentication state
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
          isSpotifyConnected: false,
          upvotes: 0,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithSpotify = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Spotify sign in error:', error);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      setIsLoading(true);
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithSpotify,
        signInAnonymously,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};