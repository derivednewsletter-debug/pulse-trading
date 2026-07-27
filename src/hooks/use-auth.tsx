'use client';

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Profile } from '@/types/database';

type AuthContextType = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();
  const user = session?.user ?? null;

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
      // Profile fetch failed silently
    } finally {
      setProfileLoading(false);
    }
  }, []);

   
  useEffect(() => {
    if (user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user?.id, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (!result?.error) {
      router.push('/');
      router.refresh();
    }
    return { error: result?.error ?? null };
  };

  const signUp = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error ?? 'Sign up failed' };
      }
      // Auto sign in after sign up
      await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      router.push('/');
      router.refresh();
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  const signInWithGoogle = async () => {
    await nextAuthSignIn('google', { redirectTo: '/' });
  };

  const signInWithGithub = async () => {
    await nextAuthSignIn('github', { redirectTo: '/' });
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading: status === 'loading' || profileLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGithub,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
