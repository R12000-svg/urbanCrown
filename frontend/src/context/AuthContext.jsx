import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase.from('profiles').select('id, full_name, phone, role').eq('id', user.id).single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data || null);
      });
    return () => { cancelled = true; };
  }, [user]);

  async function refreshProfile() {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('id, full_name, phone, role').eq('id', user.id).single();
    setProfile(data || null);
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin: Boolean(user && profile?.id === user.id && profile.role === 'admin'), loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);