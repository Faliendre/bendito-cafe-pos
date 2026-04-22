"use client"

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Coffee, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: 'var(--color-surface)' }}>
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-ambient" 
               style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            <Coffee size={40} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight mb-2" style={{ color: 'var(--color-on-surface)' }}>
            Bendito Café
          </h1>
          <p className="text-lg opacity-60 font-medium">Bienvenido al sistema POS</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-ambient border border-ghost/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 ml-1 opacity-70">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 transition-all outline-none font-medium"
                  placeholder="admin@benditocafe.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 ml-1 opacity-70">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl flex justify-center items-center gap-2 shadow-ambient active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="font-bold text-lg">Ingresar</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm opacity-40 font-medium">
          &copy; {new Date().getFullYear()} Bendito Café - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
