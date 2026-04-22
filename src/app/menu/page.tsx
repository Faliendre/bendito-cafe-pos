"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Coffee, CupSoda, CakeSlice, Apple, Star, ArrowDown } from 'lucide-react';
import Image from 'next/image';

const iconMap: Record<string, React.ReactNode> = {
  'Bebidas Calientes': <Coffee size={24} />,
  'Bebidas Frías': <CupSoda size={24} />,
  'Frappes': <CupSoda size={24} />,
  'Cócteles': <CupSoda size={24} />,
  'Bebidas Variadas': <CupSoda size={24} />,
  'Té': <Coffee size={24} />,
  'Panadería': <CakeSlice size={24} />,
  'Açaí': <Apple size={24} />,
};

export default function PublicMenu() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Bebidas Calientes');

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (!error && data) {
        setProducts(data);
        // Set first category as active if exists
        if (data.length > 0) {
          const cats = Array.from(new Set(data.map(p => p.category)));
          if (cats.length > 0) setActiveCategory(cats[0] as string);
        }
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdf7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6b4f35]/20 border-t-[#6b4f35] rounded-full animate-spin"></div>
          <p className="font-bold text-[#6b4f35] animate-pulse">Abriendo carta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdf7] text-[#2d1e12] pb-20">
      {/* Hero Header */}
      <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#2d1e12]">
          <Image 
            src="/assets/logo/logo_bentido_cafe.jpeg" 
            alt="Bendito Café Logo" 
            fill 
            className="object-cover opacity-40 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2d1e12]/50 to-[#fdfdf7]"></div>
        </div>
        
        <div className="relative z-10 text-center px-6">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-2xl overflow-hidden mb-6 bg-white">
            <Image src="/assets/logo/logo_bentido_cafe.jpeg" alt="Logo" width={128} height={128} className="object-cover" />
          </div>
          <h1 className="font-display text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">BENDITO CAFÉ</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/30">
            <Star size={16} fill="currentColor" />
            <span>Café de Especialidad</span>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
           <ArrowDown size={32} />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-40 bg-[#fdfdf7]/80 backdrop-blur-xl border-b border-[#2d1e12]/5 py-4 overflow-x-auto scrollbar-hide">
        <div className="flex px-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat as string}
              onClick={() => setActiveCategory(cat as string)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                activeCategory === cat 
                  ? 'bg-[#6b4f35] text-white scale-105' 
                  : 'bg-white text-[#6b4f35] border border-[#6b4f35]/10'
              }`}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="px-6 py-8 md:max-w-3xl md:mx-auto">
        <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-black text-[#6b4f35] mb-2">{activeCategory}</h2>
            <div className="w-12 h-1 bg-[#6b4f35] mx-auto rounded-full opacity-30"></div>
        </div>

        <div className="space-y-8">
          {filteredProducts.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 group">
              <div className="flex justify-between items-baseline gap-4">
                <h3 className="font-display text-xl font-bold flex-1">{p.name}</h3>
                <div className="flex-1 border-b-2 border-dotted border-[#2d1e12]/10 mb-1"></div>
                <span className="font-display text-xl font-bold text-[#6b4f35]">Bs. {Number(p.price).toFixed(2)}</span>
              </div>
              {p.description && (
                <p className="text-sm opacity-60 leading-relaxed font-medium pr-10">
                  {p.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <p className="font-bold italic">Próximamente más productos...</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-12 px-6 text-center border-t border-[#2d1e12]/5 pt-12 pb-12 opacity-40">
        <p className="text-xs font-bold tracking-widest uppercase mb-4">Bendito Café &copy; {new Date().getFullYear()}</p>
        <p className="text-[10px] max-w-xs mx-auto">Hecho con amor y pasión por el café. Los precios pueden variar según temporada.</p>
      </footer>
    </div>
  );
}
