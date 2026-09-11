import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

const FIVE_MINUTES = 5 * 60 * 1000;

const readTokenExpiryMs = () => {
  const token = localStorage.getItem("token");
  if (!token || token.split(".").length < 2) {
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const useTokenRefresh = () => {
  const { user, logout } = useAuth();
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const expiryMs = readTokenExpiryMs();
    if (!expiryMs) {
      return undefined;
    }

    const delay = Math.max(expiryMs - Date.now() - FIVE_MINUTES, 0);

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      logout();
    }, delay);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user, logout]);

  const manualRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    const expiryMs = readTokenExpiryMs();
    const delay = expiryMs ? Math.max(expiryMs - Date.now() - FIVE_MINUTES, 0) : 0;
    refreshTimeoutRef.current = setTimeout(() => {
      logout();
    }, delay);
  };

  return { manualRefresh };
};
