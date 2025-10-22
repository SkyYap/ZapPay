import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string } | void>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string } | void>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string } | void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function upsertProfile(user: User) {
  const { id, email } = user;
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: id, email, display_name: email?.split('@')[0] ?? 'User' }, { onConflict: 'user_id' });
  if (error) {
    // Surface in console for debugging; could be shown to user if desired
    console.error('Profile upsert failed', error.message);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        upsertProfile(data.session.user).catch(() => {});
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        upsertProfile(newSession.user).catch(() => {});
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    async signInWithPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
    },
    async signInWithMagicLink(email) {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      if (error) return { error: error.message };
    },
    async signUpWithPassword(email, password) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


