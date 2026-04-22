"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Users, UserPlus, Shield, User as UserIcon, Loader2, Save, Trash2, Mail } from 'lucide-react';

interface Profile {
  id: string;
  rol: 'admin' | 'cajero';
  email: string | null;
  created_at: string;
}

export default function EmployeesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (id: string, newRol: 'admin' | 'cajero') => {
    setUpdating(id);
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: newRol })
      .eq('id', id);

    if (!error) {
      setProfiles(profiles.map(p => p.id === id ? { ...p, rol: newRol } : p));
    }
    setUpdating(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-on-surface" style={{ background: 'var(--color-surface)' }}>
      <AdminSidebar active="employees" />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>Gestión de Empleados</h2>
            <p className="opacity-70 mt-2 text-lg">Administra los roles y accesos del personal</p>
          </div>
          <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold shadow-ambient transition-transform active:scale-95 bg-primary text-on-primary">
            <UserPlus size={20} />
            Nuevo Empleado
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold text-xl">Cargando personal...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-6 rounded-3xl shadow-ambient border-ghost border flex flex-col" style={{ background: 'var(--color-surface-container-lowest)' }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl" style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
                    <UserIcon size={32} />
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${profile.rol === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {profile.rol}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-display text-xl font-bold truncate mb-1">
                    {profile.email || "Usuario sin email"}
                  </h3>
                  <div className="flex items-center gap-2 opacity-50 text-sm font-medium">
                    <Mail size={14} />
                    <span>{profile.email || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-ghost space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Cambiar Rol</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateRole(profile.id, 'admin')}
                      disabled={profile.rol === 'admin' || updating === profile.id}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${profile.rol === 'admin' ? 'bg-amber-500 text-white' : 'border border-ghost hover:bg-black/5'}`}
                    >
                      {updating === profile.id && profile.rol !== 'admin' ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                      Admin
                    </button>
                    <button
                      onClick={() => handleUpdateRole(profile.id, 'cajero')}
                      disabled={profile.rol === 'cajero' || updating === profile.id}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${profile.rol === 'cajero' ? 'bg-primary text-on-primary' : 'border border-ghost hover:bg-black/5'}`}
                    >
                      {updating === profile.id && profile.rol !== 'cajero' ? <Loader2 className="animate-spin" size={16} /> : <Users size={16} />}
                      Cajero
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-8 rounded-3xl border border-primary/20 bg-primary/5">
          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Sobre el acceso</h4>
              <p className="text-sm opacity-70 leading-relaxed max-w-2xl">
                Los cambios de rol son instantáneos. Un <strong>Administrador</strong> tiene acceso completo a métricas, inventario y gestión de personal. Un <strong>Cajero</strong> solo puede acceder a la ventana de ventas y reportes básicos de su turno.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
