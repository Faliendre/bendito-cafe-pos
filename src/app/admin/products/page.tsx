"use client"
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Product } from '@/lib/types';
import { Plus, Edit2, ShieldCheck, ShieldAlert, Check, X, Tag } from 'lucide-react';

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [isEditing, setIsEditing] = useState<Partial<Product> | null>(null);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<Partial<Product>>({ name: '', price: 0, category: 'Café', variable_price: false, active: true });

    const categories = ['Todas', 'Café', 'Bebidas Frías', 'Frappes', 'Cócteles', 'Bebidas Variadas', 'Té', 'Panadería', 'Açaí', 'Extras'];

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        const { data, error } = await supabase.from('products').select('*').order('category');
        if (data && !error) {
            setProducts(data as Product[]);
        }
    }

    async function saveProduct(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (modalData.id) {
                // Update
                await supabase.from('products').update({
                    name: modalData.name,
                    price: modalData.price,
                    category: modalData.category,
                    variable_price: modalData.variable_price,
                    active: modalData.active
                }).eq('id', modalData.id);
            } else {
                // Insert
                await supabase.from('products').insert({
                    name: modalData.name,
                    price: modalData.price,
                    category: modalData.category,
                    variable_price: modalData.variable_price,
                    active: true
                });
            }
            setShowModal(false);
            setModalData({ name: '', price: 0, category: 'Café', variable_price: false, active: true });
            loadProducts(); // reload
        } catch (error) {
            console.error("Error saving product", error);
            alert("Error al guardar el producto");
        }
    }

    async function toggleActive(product: Product) {
        await supabase.from('products').update({ active: !product.active }).eq('id', product.id);
        loadProducts();
    }

    const filtered = categoryFilter === 'Todas' ? products : products.filter(p => p.category === categoryFilter);

    return (
        <div className="min-h-screen flex flex-col md:flex-row text-on-surface" style={{ background: 'var(--color-surface)' }}>
            <AdminSidebar active="products" />

            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>Gestión de Productos</h2>
                        <p className="opacity-70 mt-1 md:mt-2 text-base md:text-lg">Modifica precios, oculta productos y añade nuevos al menú.</p>
                    </div>
                    <button
                        onClick={() => { setModalData({ name: '', price: 0, category: 'Café', variable_price: false, active: true }); setShowModal(true); }}
                        className="btn-primary rounded-2xl flex items-center gap-2 px-6 py-3 font-bold shadow-ambient transition-transform active:scale-95 w-full md:w-auto mt-4 md:mt-0 justify-center"
                    >
                        <Plus size={20} /> Nuevo Producto
                    </button>
                </header>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:mb-8 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 md:px-5 py-2.5 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-colors border shadow-sm ${categoryFilter === cat ? '' : 'hover:bg-black/5 opacity-70 border-transparent'}`}
                            style={categoryFilter === cat ? { background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)', borderColor: 'var(--color-ghost)' } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl shadow-ambient border-ghost border overflow-x-auto" style={{ background: 'var(--color-surface-container-lowest)' }}>
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-ghost text-sm md:text-base" style={{ background: 'var(--color-surface-container-low)' }}>
                                <th className="p-4 md:p-5 font-bold opacity-70">Estado</th>
                                <th className="p-4 md:p-5 font-bold opacity-70">Nombre</th>
                                <th className="p-4 md:p-5 font-bold opacity-70">Categoría</th>
                                <th className="p-4 md:p-5 font-bold opacity-70">Precio (Bs)</th>
                                <th className="p-4 md:p-5 font-bold w-1/4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className={`border-b border-ghost/50 transition-colors hover:bg-black/5 ${!p.active ? 'opacity-50' : ''}`}>
                                    <td className="p-5">
                                        {p.active ? <ShieldCheck className="text-green-600" /> : <ShieldAlert className="text-red-500" />}
                                    </td>
                                    <td className="p-5 font-bold text-lg">{p.name} {p.variable_price && <Tag size={14} className="inline ml-2 opacity-50" />}</td>
                                    <td className="p-5 font-medium">{p.category}</td>
                                    <td className="p-5 font-bold">{p.variable_price ? 'Variable' : `Bs. ${Number(p.price).toFixed(2)}`}</td>
                                    <td className="p-5 flex gap-3">
                                        <button
                                            onClick={() => { setModalData(p); setShowModal(true); }}
                                            className="p-3 rounded-xl border border-ghost hover:bg-white shadow-sm transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleActive(p)}
                                            className="font-bold px-4 rounded-xl border border-ghost hover:bg-black/10 transition-colors text-sm"
                                        >
                                            {p.active ? 'Pausar' : 'Reactivar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center opacity-60 font-medium">No hay productos en esta categoría.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center glass-panel p-4 overflow-y-auto">
                        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-ambient relative" style={{ background: 'var(--color-surface-container-highest)' }}>
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 opacity-50 hover:opacity-100"><X size={24} /></button>

                            <h3 className="font-display text-2xl font-bold mb-6">{modalData.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <form onSubmit={saveProduct} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold opacity-70 mb-2">Nombre del Producto</label>
                                    <input required value={modalData.name} onChange={e => setModalData({ ...modalData, name: e.target.value })} className="w-full p-4 rounded-xl border border-ghost shadow-sm focus:outline-none" style={{ background: 'var(--color-surface-container-lowest)' }} placeholder="Ej: Vaso Eco 500ml" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold opacity-70 mb-2">Precio Base (Bs)</label>
                                        <input type="number" step="0.10" required value={modalData.price} disabled={modalData.variable_price} onChange={e => setModalData({ ...modalData, price: Number(e.target.value) })} className={`w-full p-4 rounded-xl border border-ghost shadow-sm focus:outline-none ${modalData.variable_price ? 'opacity-50' : ''}`} style={{ background: 'var(--color-surface-container-lowest)' }} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold opacity-70 mb-2">Categoría</label>
                                        <select value={modalData.category} onChange={e => setModalData({ ...modalData, category: e.target.value as string })} className="w-full p-4 h-full rounded-xl border border-ghost shadow-sm focus:outline-none" style={{ background: 'var(--color-surface-container-lowest)' }}>
                                            {categories.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 border border-ghost rounded-xl shadow-sm" style={{ background: 'var(--color-surface-container-lowest)' }}>
                                    <input type="checkbox" id="vprice" checked={modalData.variable_price || false} onChange={e => setModalData({ ...modalData, variable_price: e.target.checked })} className="w-5 h-5 accent-black" />
                                    <label htmlFor="vprice" className="font-bold cursor-pointer">PRECIO VARIABLE<br /><span className="text-xs font-normal opacity-70 font-sans">Ideal para Açaí por peso. Pregunta al cajero en cada venta.</span></label>
                                </div>
                                <button type="submit" className="w-full mt-4 py-4 font-bold rounded-xl btn-primary text-lg">
                                    Guardar Cambios
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
