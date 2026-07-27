'use client';

import { useAuth } from '@/hooks/use-auth';
import { useCallback, useRef } from 'react';

/**
 * Hook that manages CSRF tokens for mutation requests.
 *
 * Fetches a token from `/api/csrf` and caches it in memory.
 * If the server returns 403 (expired token), it auto-refreshes.
 */
export function useCsrfToken() {
  const { user } = useAuth();
  const tokenRef = useRef<string | null>(null);
  const fetchingRef = useRef(false);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    // Return cached token if available
    if (tokenRef.current) return tokenRef.current;

    // Prevent concurrent fetches
    if (fetchingRef.current) {
      // Wait a bit and try again
      await new Promise((r) => setTimeout(r, 500));
      return tokenRef.current;
    }

    fetchingRef.current = true;
    try {
      const response = await fetch('/api/csrf');
      if (!response.ok) {
        console.error('[CSRF] Failed to fetch token:', response.status);
        return null;
      }
      const data = await response.json();
      tokenRef.current = data.token;
      return data.token;
    } catch (error) {
      console.error('[CSRF] Error fetching token:', error);
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, [user]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    tokenRef.current = null;
    return getToken();
  }, [getToken]);

  /**
   * Fetch with automatic CSRF token injection and retry on 403.
   */
  const fetchWithCsrf = useCallback(
    async (
      url: string,
      options: RequestInit = {}
    ): Promise<Response> => {
      const token = await getToken();
      if (!token) {
        // If no token (not logged in), proceed without CSRF
        return fetch(url, options);
      }

      const headers = new Headers(options.headers);
      headers.set('x-csrf-token', token);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If token expired, refresh and retry once
      if (response.status === 403) {
        const newToken = await refreshToken();
        if (newToken) {
          const retryHeaders = new Headers(options.headers);
          retryHeaders.set('x-csrf-token', newToken);
          return fetch(url, {
            ...options,
            headers: retryHeaders,
          });
        }
      }

      return response;
    },
    [getToken, refreshToken]
  );

  return { getToken, refreshToken, fetchWithCsrf };
}
