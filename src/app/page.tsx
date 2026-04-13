"use client"
import React from 'react';
import { PosProvider } from '@/lib/pos-context';
import { Sidebar } from '@/components/pos/Sidebar';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderSummary } from '@/components/pos/OrderSummary';

export default function PosPage() {
  return (
    <PosProvider>
      <div className="flex h-screen w-full overflow-hidden select-none">
        <Sidebar />
        <ProductGrid />
        <OrderSummary />
      </div>
    </PosProvider>
  );
}
