import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useTokenRefresh = () => {
  const { user, logout } = useAuth();
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user || !user.token) {
      return;
    }

    // Set up token refresh timer (refresh 5 minutes before expiry)
    const setupTokenRefresh = () => {
      // Clear existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // JWT tokens typically expire in 1 hour, so refresh after 55 minutes
      const refreshTime = 55 * 60 * 1000; // 55 minutes in milliseconds
      
      refreshTimeoutRef.current = setTimeout(() => {
        // Attempt to refresh token
        refreshToken();
      }, refreshTime);
    };

    const refreshToken = async () => {
      try {
        // You can implement token refresh logic here
        // For now, we'll just logout the user when token expires
        console.log('Token expired, logging out user');
        logout();
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    setupTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user, logout]);

  // Function to manually refresh token (can be called from components)
  const manualRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    // Reset the timer
    const refreshTime = 55 * 60 * 1000;
    refreshTimeoutRef.current = setTimeout(() => {
      logout();
    }, refreshTime);
  };

  return { manualRefresh };
};
