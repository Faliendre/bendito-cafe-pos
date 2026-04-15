"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { Sidebar } from '@/components/pos/Sidebar';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderSummary } from '@/components/pos/OrderSummary';
import { ShoppingCart, X } from 'lucide-react';

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
      <div className={`${showCart ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[400px] h-full z-50 md:z-auto bg-white absolute md:relative inset-0 md:inset-auto`}>
        {showCart && (
          <div className="p-4 flex justify-between items-center border-b border-ghost md:hidden" style={{ background: 'var(--color-surface-container-low)' }}>
            <h2 className="font-display text-xl font-bold">Carrito ({items})</h2>
            <button onClick={() => setShowCart(false)} className="p-2 opacity-70 hover:opacity-100"><X size={24} /></button>
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
