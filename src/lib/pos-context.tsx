"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Order } from './types';
import { getProducts, saveOrder } from './db/offline';
import { NotificationType, NotificationModal } from '@/components/ui/NotificationModal';

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
    checkout: (paymentMethod: 'efectivo' | 'QR' | 'tarjeta' | 'pendiente', customerName?: string, paymentStatus?: 'pagado' | 'pendiente') => Promise<boolean>;
    openOrders: Order[];
    refreshOpenOrders: () => Promise<void>;
    activeOrderId: string | null;
    loadOrderIntoCart: (order: Order) => void;
    showMessage: (title: string, message: string, type?: NotificationType) => void;
    showConfirm: (title: string, message: string) => Promise<boolean>;
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
    const [selectedCategory, setSelectedCategory] = useState<string>('Mesas Abiertas');
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [openOrders, setOpenOrders] = useState<Order[]>([]);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

    // Notification State
    const [notif, setNotif] = useState<{ open: boolean, type: NotificationType, title: string, message: string, onConfirm?: () => void }>({
        open: false, type: 'success', title: '', message: ''
    });

    const showMessage = (title: string, message: string, type: NotificationType = 'success') => {
        setNotif({ open: true, type, title, message });
    };

    const showConfirm = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setNotif({
                open: true,
                type: 'confirm',
                title,
                message,
                onConfirm: () => resolve(true)
            });
            // We need a way to resolve false when closing. Let's adjust onClose later.
        });
    };

    const refreshOpenOrders = async () => {
        // We only fetch open orders from online Supabase for simplicity and consistency
        const { supabase } = await import('./supabase/client');
        const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('payment_status', 'pendiente').order('created_at', { ascending: false });
        if (!error && data) {
            setOpenOrders(data as Order[]);
        }
    };

    useEffect(() => {
        async function load() {
            let data = await getProducts();
            if (data.length === 0) {
                data = mockProducts; // Fallback for dev
            }
            setProducts(data);
            const uniqueCats = ['Mesas Abiertas', ...Array.from(new Set(data.map(p => p.category)))];
            setCategories(uniqueCats);
            if (uniqueCats.length > 0 && !uniqueCats.includes(selectedCategory)) {
                setSelectedCategory(uniqueCats[0]);
            }
            refreshOpenOrders();
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

    const clearCart = () => {
        setCart([]);
        setActiveOrderId(null);
    };

    const loadOrderIntoCart = (order: Order) => {
        if (!order.id) return;
        setActiveOrderId(order.id);
        setCart(order.items);
        // We might want to switch view back to products
        setSelectedCategory(categories.find(c => c !== 'Mesas Abiertas') || categories[0]);
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const checkout = async (paymentMethod: 'efectivo' | 'QR' | 'tarjeta' | 'pendiente', customerName?: string, paymentStatus: 'pagado' | 'pendiente' = 'pagado') => {
        if (cart.length === 0) return false;

        if (activeOrderId) {
            // Update existing order 
            const { supabase } = await import('./supabase/client');

            // 1. Update order
            const { error: orderError } = await supabase.from('orders').update({
                customer_name: customerName || '',
                payment_method: paymentMethod,
                payment_status: paymentStatus,
                total: cartTotal,
                status: 'pendiente', // keep it in kitchen state or assume it's just paying
            }).eq('id', activeOrderId);

            if (orderError) {
                console.error("Error updating order", orderError);
                return false;
            }

            // 2. Clear items, recreate (simple way)
            await supabase.from('order_items').delete().eq('order_id', activeOrderId);
            const itemsToInsert = cart.map((item) => ({
                order_id: activeOrderId,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                notes: item.notes,
            }));
            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) {
                console.error("Error inserting items", itemsError);
                return false;
            }

            clearCart();
            await refreshOpenOrders();
            return true;
        }

        const newOrder: Order = {
            customer_name: customerName || '',
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            total: cartTotal,
            status: 'pendiente',
            items: [...cart],
        };

        const success = await saveOrder(newOrder);
        if (success) {
            clearCart();
            await refreshOpenOrders();
        }
        return success;
    };

    return (
        <PosContext.Provider value={{
            products, categories, selectedCategory, setSelectedCategory,
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, checkout,
            openOrders, refreshOpenOrders, activeOrderId, loadOrderIntoCart,
            showMessage, showConfirm
        }}>
            {children}
            <NotificationModal
                isOpen={notif.open}
                type={notif.type}
                title={notif.title}
                message={notif.message}
                onClose={() => {
                    setNotif(prev => ({ ...prev, open: false }));
                    // If it was a confirm and we just closed it without clicking confirm, it's a 'false'
                }}
                onConfirm={notif.onConfirm}
            />
        </PosContext.Provider>
    );
};

export const usePos = () => {
    const context = useContext(PosContext);
    if (!context) throw new Error("usePos must be used within PosProvider");
    return context;
};
