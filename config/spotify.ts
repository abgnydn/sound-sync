export const spotifyConfig = {
  clientId: 'dfdff56998e348c79a53671a7ba0baee',
  redirectUri: 'exp://localhost:8081/--/spotify-auth-callback',
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