"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { Sidebar } from '@/components/pos/Sidebar';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderSummary } from '@/components/pos/OrderSummary';
import { X } from 'lucide-react';

function PosContent() {
  const [showCart, setShowCart] = useState(false);
  const { cart } = usePos();
  const items = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden select-none" style={{ background: 'var(--color-surface)' }}>
      <Sidebar />

      {/* Product Grid - Hidden on mobile if cart is open */}
      <div className={`flex-1 overflow-hidden relative ${showCart ? 'hidden md:flex' : 'flex'}`}>
        <ProductGrid />

        {/* Floating Button for Mobile */}
        {!showCart && (
          <div className="absolute bottom-4 left-0 right-0 px-4 z-40 md:hidden">
            <button
              onClick={() => setShowCart(true)}
              className="w-full py-4 px-6 rounded-2xl flex justify-between items-center shadow-ambient active:scale-95 transition-transform"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">{items}</span>
                <span className="font-bold text-lg">Ver Orden</span>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">Bs. {total.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Order Summary - Full screen on mobile, sidebar on desktop */}
      <div className={`${showCart ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[400px] h-full z-50 md:z-auto bg-white fixed md:relative inset-0 md:inset-auto`}>
        {showCart && (
          <div className="p-5 flex justify-between items-center border-b border-ghost md:hidden" style={{ background: 'var(--color-surface-container-low)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{items}</div>
              <h2 className="font-display text-xl font-bold">Resumen de Orden</h2>
            </div>
            <button onClick={() => setShowCart(false)} className="p-3 bg-black/5 rounded-full opacity-70 hover:opacity-100 active:scale-90 transition-transform">
              <X size={24} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-hidden relative">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

export default function PosPage() {
  return <PosContent />;
}
