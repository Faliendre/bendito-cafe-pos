"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Order } from './types';
import { getProducts, saveOrder } from './db/offline';

interface PosContextType {
    products: Product[];
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (c: string) => void;
    cart: OrderItem[];
    addToCart: (p: Product, quantity?: number, notes?: string, customPrice?: number) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    checkout: (paymentMethod: 'efectivo' | 'QR' | 'tarjeta', customerName?: string) => Promise<boolean>;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

// Mock products for when DB is empty or missing setup
const mockProducts: Product[] = [
    { id: '1', name: 'Espresso', price: 15.00, category: 'Café', variable_price: false, active: true },
    { id: '2', name: 'Cappuccino', price: 22.00, category: 'Café', variable_price: false, active: true },
    { id: '3', name: 'Iced Latte', price: 25.00, category: 'Bebidas Frías', variable_price: false, active: true },
    { id: '4', name: 'Frappé Oreo', price: 30.00, category: 'Frappes', variable_price: false, active: true },
    { id: '5', name: 'Açaí', price: 0.00, category: 'Açaí', variable_price: true, active: true },
    { id: '6', name: 'Croissant', price: 15.00, category: 'Panadería', variable_price: false, active: true },
];

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Café');
    const [cart, setCart] = useState<OrderItem[]>([]);

    useEffect(() => {
        async function load() {
            let data = await getProducts();
            if (data.length === 0) {
                data = mockProducts; // Fallback for dev
            }
            setProducts(data);
            const uniqueCats = Array.from(new Set(data.map(p => p.category)));
            setCategories(uniqueCats);
            if (uniqueCats.length > 0 && !uniqueCats.includes(selectedCategory)) {
                setSelectedCategory(uniqueCats[0]);
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addToCart = (p: Product, quantity = 1, notes = "", customPrice?: number) => {
        const finalPrice = p.variable_price && customPrice !== undefined ? customPrice : p.price;
        setCart(prev => {
            // If exactly the same product & notes & price, just increase quantity
            const existingIdx = prev.findIndex(item =>
                item.product_id === p.id && item.notes === notes && item.price === finalPrice
            );
            if (existingIdx >= 0) {
                const newCart = [...prev];
                newCart[existingIdx].quantity += quantity;
                return newCart;
            }
            return [...prev, {
                product_id: p.id,
                product_name: p.name,
                price: finalPrice,
                quantity,
                notes
            }];
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) return removeFromCart(index);
        setCart(prev => {
            const newCart = [...prev];
            newCart[index].quantity = quantity;
            return newCart;
        });
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const checkout = async (paymentMethod: 'efectivo' | 'QR' | 'tarjeta', customerName?: string) => {
        if (cart.length === 0) return false;

        const newOrder: Order = {
            customer_name: customerName || '',
            payment_method: paymentMethod,
            total: cartTotal,
            status: 'pendiente',
            items: [...cart],
        };

        const success = await saveOrder(newOrder);
        if (success) {
            clearCart();
        }
        return success;
    };

    return (
        <PosContext.Provider value={{
            products, categories, selectedCategory, setSelectedCategory,
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, checkout
        }}>
            {children}
        </PosContext.Provider>
    );
};

export const usePos = () => {
    const context = useContext(PosContext);
    if (!context) throw new Error("usePos must be used within PosProvider");
    return context;
};
