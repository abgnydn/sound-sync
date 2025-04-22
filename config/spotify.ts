export const spotifyConfig = {
  clientId: '1234567890abcdef1234567890abcdef',
  redirectUri: 'soundsync://spotify-auth-callback',
  scopes: [
    'user-read-email', 
    'user-read-private', 
    'user-read-playback-state', 
    'user-modify-playback-state',
    'streaming',
    'user-library-read'
  ],
  tokenRefreshURL: 'https://soundsync-token-refresh.vercel.app/api/refresh'
};