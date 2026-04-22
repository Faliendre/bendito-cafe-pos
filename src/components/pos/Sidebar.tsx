"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { useAuth } from '@/lib/auth-context';
import { Coffee, CupSoda, CakeSlice, Apple, PlusCircle, LayoutDashboard, LogOut, Receipt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { isToday, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase/client';

const iconMap: Record<string, React.ReactNode> = {
    'Mesas Abiertas': <Receipt size={24} />,
    'Café': <Coffee size={24} />,
    'Bebidas Frías': <CupSoda size={24} />,
    'Bebidas Variadas': <CupSoda size={24} />,
    'Frappes': <CupSoda size={24} />,
    'Cócteles': <CupSoda size={24} />, 
    'Té': <Coffee size={24} />,
    'Panadería': <CakeSlice size={24} />,
    'Açaí': <Apple size={24} />,
    'Extras': <PlusCircle size={24} />
};

export function Sidebar() {
    const { categories, selectedCategory, setSelectedCategory, openOrders, showMessage } = usePos();
    const { isAdmin, signOut } = useAuth();
    const [showEndShift, setShowEndShift] = useState(false);
    const [daySummary, setDaySummary] = useState<{ efectivo: number, QR: number, tarjeta: number, total: number } | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    const handleOpenEndShift = async () => {
        setShowEndShift(true);
        if (openOrders.length === 0) {
            setLoadingSummary(true);
            try {
                const { data, error } = await supabase.from('orders').select('*').eq('payment_status', 'pagado');
                if (!error && data) {
                    let e = 0, q = 0, t = 0;
                    data.forEach(o => {
                        const date = o.created_at ? parseISO(o.created_at) : new Date();
                        if (isToday(date)) {
                            const amount = Number(o.total);
                            if (o.payment_method === 'efectivo') e += amount;
                            if (o.payment_method === 'QR') q += amount;
                            if (o.payment_method === 'tarjeta') t += amount;
                        }
                    });
                    setDaySummary({ efectivo: e, QR: q, tarjeta: t, total: e + q + t });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSummary(false);
            }
        }
    };

    return (
        <div className="w-full md:w-32 h-auto md:h-full flex flex-row md:flex-col pt-2 pb-2 md:pt-6 md:pb-6 flex-shrink-0" style={{ background: 'var(--color-surface-container-low)' }}>
            <div className="hidden md:flex justify-center items-center mb-8 px-2">
                <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                    <Image src="/assets/logo/logo_bentido_cafe.jpeg" alt="Bendito Café" fill sizes="64px" className="object-cover" />
                </div>
            </div>

            <div className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden md:overflow-y-auto px-2 md:px-3 gap-2 md:gap-0 md:space-y-4 scrollbar-hide">
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`min-w-[4.5rem] md:w-full md:aspect-square flex flex-col items-center justify-center p-2 md:p-0 rounded-2xl md:rounded-[1.5rem] transition-all
                ${isActive ? 'shadow-ambient bg-white' : 'hover:bg-black/5'}
              `}
                            style={{
                                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'
                            }}
                        >
                            <div className="mb-1 md:mb-2 scale-75 md:scale-100">
                                {iconMap[cat] || <Coffee size={24} />}
                            </div>
                            <span className="text-[10px] md:text-sm font-bold text-center leading-tight whitespace-nowrap md:whitespace-normal">{cat}</span>
                        </button>
                    );
                })}

                {/* Controles extra para móvil (al final de la lista) */}
                {true && (
                    <Link href="/admin" className="md:hidden min-w-[4.5rem] flex flex-col items-center justify-center p-2 rounded-2xl transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <div className="mb-1 scale-75"><LayoutDashboard size={24} /></div>
                        <span className="text-[10px] font-bold text-center leading-tight">Admin</span>
                    </Link>
                )}
                <button onClick={handleOpenEndShift} className="md:hidden min-w-[4.5rem] flex flex-col items-center justify-center p-2 rounded-2xl transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <div className="mb-1 scale-75"><LogOut size={24} /></div>
                    <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap">Cerrar</span>
                </button>
                <button onClick={() => signOut()} className="md:hidden min-w-[4.5rem] flex flex-col items-center justify-center p-2 rounded-2xl transition-all hover:bg-black/5 text-red-500">
                    <div className="mb-1 scale-75"><LogOut size={24} /></div>
                    <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap">Salir</span>
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="hidden md:block mt-auto pt-6 px-3 space-y-4 border-t border-black/5">
                {true && (
                    <Link href="/admin" className="w-full aspect-square flex flex-col items-center justify-center rounded-[1.5rem] transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <LayoutDashboard size={24} className="mb-2" />
                        <span className="text-[11px] md:text-sm font-bold">Admin</span>
                    </Link>
                )}
                <button onClick={handleOpenEndShift} className="w-full aspect-square flex flex-col items-center justify-center rounded-[1.5rem] transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <LogOut size={24} className="mb-2" />
                    <span className="text-[11px] md:text-xs font-bold leading-tight text-center">Cerrar Día</span>
                </button>
                <button onClick={() => signOut()} className="w-full aspect-square flex flex-col items-center justify-center rounded-[1.5rem] transition-all hover:bg-black/10 text-red-600">
                    <LogOut size={24} className="mb-2 rotate-180" />
                    <span className="text-[11px] md:text-xs font-bold leading-tight text-center">Salir</span>
                </button>
            </div>

            {showEndShift && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center glass-panel p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-ambient" style={{ background: 'var(--color-surface-container-highest)' }}>
                        <h3 className="font-display text-2xl font-bold mb-4 text-center">Cierre de Día</h3>

                        {openOrders.length > 0 ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt size={32} />
                                </div>
                                <h4 className="font-bold text-red-600 mb-2">¡Cuentas Pendientes!</h4>
                                <p className="opacity-70 mb-8 font-medium">Aún tienes <strong>{openOrders.length}</strong> cuentas abiertas. Debes cobrarlas o cancelarlas antes de cerrar el día.</p>
                                <button
                                    onClick={() => { setShowEndShift(false); setSelectedCategory('Mesas Abiertas'); }}
                                    className="w-full py-4 font-bold rounded-xl btn-primary shadow-sm"
                                >
                                    Ver Cuentas Abiertas
                                </button>
                                <button onClick={() => setShowEndShift(false)} className="w-full py-4 mt-2 font-bold opacity-60">Cancelar</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="opacity-70 text-center font-medium">Resumen de ventas de hoy:</p>

                                {loadingSummary ? (
                                    <div className="py-8 text-center animate-pulse opacity-50 font-bold">Calculando totales...</div>
                                ) : daySummary ? (
                                    <div className="space-y-3 bg-white/50 p-4 rounded-2xl border border-ghost">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="opacity-70">En Efectivo:</span>
                                            <span className="font-bold">Bs. {daySummary.efectivo.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="opacity-70">En QR:</span>
                                            <span className="font-bold">Bs. {daySummary.QR.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="opacity-70">En Tarjeta:</span>
                                            <span className="font-bold">Bs. {daySummary.tarjeta.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-3 border-t border-ghost flex justify-between items-center">
                                            <span className="font-bold">TOTAL HOY:</span>
                                            <span className="font-display font-black text-xl text-primary">Bs. {daySummary.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex gap-4">
                                    <button onClick={() => setShowEndShift(false)} className="flex-1 py-4 font-bold rounded-xl border border-ghost hover:bg-white/50 transition-colors">Cancelar</button>
                                    <button onClick={() => {
                                        setShowEndShift(false);
                                        showMessage("Turno Cerrado", "El turno ha finalizado y el reporte se ha generado correctamente.", "success");
                                    }} className="flex-1 py-4 font-bold rounded-xl btn-primary">Finalizar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
