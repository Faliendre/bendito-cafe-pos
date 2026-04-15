"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { Product } from '@/lib/types';
import { OpenOrdersGrid } from './OpenOrdersGrid';

export function ProductGrid() {
    const { products, selectedCategory, addToCart } = usePos();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Modals state
    const [showNotes, setShowNotes] = useState(false);
    const [showPrice, setShowPrice] = useState(false);

    const [notes, setNotes] = useState('');
    const [customPrice, setCustomPrice] = useState('');

    const filteredProducts = products.filter(p => p.category === selectedCategory);

    if (selectedCategory === 'Mesas Abiertas') {
        return <OpenOrdersGrid />;
    }

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setNotes('');
        setCustomPrice('');

        if (product.variable_price) {
            setShowPrice(true);
        } else {
            setShowNotes(true);
        }
    };

    const confirmAdd = () => {
        if (!selectedProduct) return;

        let price = selectedProduct.price;
        if (selectedProduct.variable_price) {
            price = parseFloat(customPrice);
            if (isNaN(price) || price <= 0) return; // simple validation
        }

        addToCart(selectedProduct, 1, notes.trim(), price);

        setShowNotes(false);
        setShowPrice(false);
        setSelectedProduct(null);
    };

    const addDirectly = (product: Product) => {
        if (product.variable_price) {
            handleProductClick(product); // Needs price
        } else {
            addToCart(product, 1, '');
        }
    };

    return (
        <div className="flex-1 p-4 md:p-6 pb-32 md:pb-6 overflow-y-auto">
            <h2 className="text-3xl font-display font-semibold mb-6 tracking-tight">{selectedCategory}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                    <button
                        key={product.id}
                        onClick={() => addDirectly(product)}
                        className="flex flex-col items-start justify-between p-4 h-32 rounded-2xl bg-white shadow-sm border border-ghost hover:shadow-ambient transform transition-transform active:scale-95"
                        style={{ backgroundColor: 'var(--color-surface-container-lowest)' }}
                    >
                        <span className="font-semibold text-lg leading-tight text-left text-on-surface">{product.name}</span>
                        <div className="w-full flex justify-between items-center mt-2">
                            <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                                {product.variable_price ? 'Precio Vble' : `Bs. ${product.price.toFixed(2)}`}
                            </span>
                            <div
                                onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500"
                            >
                                +
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Modals could be extracted to separate components for clarity */}
            {/* Price Modal */}
            {showPrice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center glass-panel p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-ambient">
                        <h3 className="font-display text-xl font-bold mb-4">Monto para {selectedProduct?.name}</h3>
                        <input
                            type="number"
                            placeholder="Ej. 15.50"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="w-full text-2xl p-4 mb-4 border-ghost rounded-lg focus:outline-none focus:ring-2"
                            style={{ background: 'var(--color-surface-container-low)' }}
                            autoFocus
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setShowPrice(false)} className="flex-1 py-3 rounded-xl font-bold border border-ghost">Cancelar</button>
                            <button onClick={() => { setShowPrice(false); setShowNotes(true); }} className="flex-1 py-3 rounded-xl font-bold btn-primary">Siguiente</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center glass-panel p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-ambient">
                        <h3 className="font-display text-xl font-bold mb-4">Personalizar {selectedProduct?.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['Sin azúcar', 'Leche Almendra', 'Para llevar', 'Extra espresso'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setNotes(prev => prev ? prev + ', ' + st : st)}
                                    className="px-3 py-2 rounded-full text-sm"
                                    style={{ background: 'var(--color-secondary-fixed-dim)' }}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Notas adicionales..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full text-lg p-3 mb-4 border-ghost rounded-lg focus:outline-none h-24 resize-none"
                            style={{ background: 'var(--color-surface-container-low)' }}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setShowNotes(false); setSelectedProduct(null); }}
                                className="flex-1 py-3 rounded-xl font-bold border border-ghost"
                            >
                                Cancelar
                            </button>
                            <button onClick={confirmAdd} className="flex-1 py-3 rounded-xl font-bold btn-primary">
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
