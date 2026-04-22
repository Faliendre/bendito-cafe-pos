"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

interface Profile {
  id: string;
  rol: 'admin' | 'cajero';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (userId: string) => {
    setFetchingProfile(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setFetchingProfile(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Intentar obtener la sesión inmediata (es mucho más rápido que esperar al evento)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.id);
      }
      
      setLoading(false);

      // 2. Escuchar cambios futuros (login, logout, refresh de token)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const newUser = session?.user ?? null;
        
        // Solo actualizamos si el usuario realmente cambió
        if (newUser?.id !== currentUser?.id) {
          setUser(newUser);
          if (newUser) {
            await fetchProfile(newUser.id);
          } else {
            setProfile(null);
          }
        }
        setLoading(false);
      });

      return subscription;
    };

    const authSub = initializeAuth();

    return () => {
      authSub.then(sub => sub?.unsubscribe());
    };
  }, []);

  // Lógica de Redirección Protegida (DESACTIVADA TEMPORALMENTE para discusión con la dueña)
  useEffect(() => {
    /* 
    if (loading || fetchingProfile) return;
    const isLoginPage = pathname === '/login';
    const isMenuPage = pathname === '/menu';
    const isAdminPage = pathname.startsWith('/admin');

    if (!user) {
      if (!isLoginPage && !isMenuPage) {
        router.push('/login');
      }
    } else {
      if (!profile && !isLoginPage && !isMenuPage) {
        console.warn("Usuario logueado pero sin perfil");
      }
      if (isLoginPage && profile) {
        router.push('/');
      }
      if (isAdminPage && profile && profile.rol !== 'admin') {
        router.push('/');
      }
    }
    */
  }, [user, profile, loading, fetchingProfile, pathname, router]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    router.push('/login');
    setLoading(false);
  };

  const value = {
    user,
    profile,
    loading: loading || fetchingProfile,
    signOut,
    isAdmin: profile?.rol === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {(loading || fetchingProfile) ? (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-surface)' }}>
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="font-bold opacity-40 animate-pulse">Cargando sistema...</p>
        </div>
      ) : (user && !profile && pathname !== '/login') ? (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 p-6 text-center" style={{ background: 'var(--color-surface)' }}>
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold mb-2">Perfil no encontrado</h1>
            <p className="opacity-60 max-w-xs mx-auto">Tu usuario existe pero no tienes un perfil asignado en el sistema. Contacta al administrador.</p>
          </div>
          <button 
            onClick={signOut}
            className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-ambient active:scale-95 transition-transform"
          >
            Cerrar Sesión y Reintentar
          </button>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
