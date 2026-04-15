"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { Coffee, CupSoda, CakeSlice, Apple, PlusCircle, LayoutDashboard, LogOut, Receipt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const iconMap: Record<string, React.ReactNode> = {
    'Mesas Abiertas': <Receipt size={24} />,
    'Café': <Coffee size={24} />,
    'Bebidas Frías': <CupSoda size={24} />,
    'Bebidas Variadas': <CupSoda size={24} />,
    'Frappes': <CupSoda size={24} />,
    'Cócteles': <CupSoda size={24} />, // Reusing CupSoda for cocktail
    'Té': <Coffee size={24} />,
    'Panadería': <CakeSlice size={24} />,
    'Açaí': <Apple size={24} />,
    'Extras': <PlusCircle size={24} />
};

export function Sidebar() {
    const { categories, selectedCategory, setSelectedCategory } = usePos();
    const [showEndShift, setShowEndShift] = useState(false);

    return (
        <div className="w-full md:w-32 h-auto md:h-full flex flex-row md:flex-col pt-2 pb-2 md:pt-6 md:pb-6 flex-shrink-0" style={{ background: 'var(--color-surface-container-low)' }}>
            <div className="hidden md:flex justify-center items-center mb-8 px-2">
                <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                    <Image src="/assets/logo/logo_bentido_cafe.jpeg" alt="Bendito Café" fill className="object-cover" />
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
                <Link href="/admin" className="md:hidden min-w-[4.5rem] flex flex-col items-center justify-center p-2 rounded-2xl transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <div className="mb-1 scale-75"><LayoutDashboard size={24} /></div>
                    <span className="text-[10px] font-bold text-center leading-tight">Admin</span>
                </Link>
                <button onClick={() => setShowEndShift(true)} className="md:hidden min-w-[4.5rem] flex flex-col items-center justify-center p-2 rounded-2xl transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <div className="mb-1 scale-75"><LogOut size={24} /></div>
                    <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap">Cerrar</span>
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="hidden md:block mt-auto pt-6 px-3 space-y-4 border-t border-black/5">
                <Link href="/admin" className="w-full aspect-square flex flex-col items-center justify-center rounded-[1.5rem] transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <LayoutDashboard size={24} className="mb-2" />
                    <span className="text-[11px] md:text-sm font-bold">Admin</span>
                </Link>
                <button onClick={() => setShowEndShift(true)} className="w-full aspect-square flex flex-col items-center justify-center rounded-[1.5rem] transition-all hover:bg-black/5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <LogOut size={24} className="mb-2" />
                    <span className="text-[11px] md:text-xs font-bold leading-tight text-center">Cerrar Día</span>
                </button>
            </div>

            {showEndShift && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center glass-panel p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-ambient text-center" style={{ background: 'var(--color-surface-container-highest)' }}>
                        <h3 className="font-display text-2xl font-bold mb-4">¿Finalizar Turno del Día?</h3>
                        <p className="opacity-70 mb-8 font-medium">Al cerrar el día, la sesión de caja finalizará y se enviará un reporte.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowEndShift(false)} className="flex-1 py-4 font-bold rounded-xl border border-ghost hover:bg-white/50 transition-colors">Cancelar</button>
                            <button onClick={() => {
                                setShowEndShift(false);
                                alert("Turno finalizado con éxito.");
                            }} className="flex-1 py-4 font-bold rounded-xl btn-primary">Cerrar Día</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
