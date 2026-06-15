'use client';

import { useEffect } from 'react';
import { setAccessTokenCookie, clearAccessTokenCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/lib/store';

export function AuthSync() {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      setAccessTokenCookie(accessToken);
    } else {
      clearAccessTokenCookie();
    }
  }, [isAuthenticated, accessToken]);

  return null;
}
