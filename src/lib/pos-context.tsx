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
    checkout: (
        paymentMethod: 'efectivo' | 'QR' | 'tarjeta' | 'pendiente', 
        customerName?: string, 
        paymentStatus?: 'pagado' | 'pendiente',
        cashReceived?: number,
        changeReturned?: number
    ) => Promise<boolean>;
    checkoutSplit: (
        paymentMethod: 'efectivo' | 'QR' | 'tarjeta',
        customerName: string,
        paidItems: OrderItem[],
        remainingItems: OrderItem[],
        cashReceived?: number,
        changeReturned?: number
    ) => Promise<boolean>;
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
    // Bebidas Calientes
    { id: 'm1', name: 'Espresso', price: 10.00, category: 'Bebidas Calientes', description: 'La base de todo. Extracción pura de café (20ml).', variable_price: false, active: true },
    { id: 'm2', name: 'Cortado', price: 10.00, category: 'Bebidas Calientes', description: 'Espresso suavizado con leche.', variable_price: false, active: true },
    { id: 'm3', name: 'Americano', price: 12.00, category: 'Bebidas Calientes', description: 'Doble espresso suavemente diluido en agua caliente.', variable_price: false, active: true },
    { id: 'm4', name: 'Flat White', price: 15.00, category: 'Bebidas Calientes', description: 'Doble espresso con leche vaporizada sedosa, más intenso que un latte.', variable_price: false, active: true },
    { id: 'm5', name: 'Cappuccino', price: 15.00, category: 'Bebidas Calientes', description: 'Equilibrio perfecto de espresso, leche vaporizada y abundante espuma.', variable_price: false, active: true },
    { id: 'm6', name: 'Latte', price: 15.00, category: 'Bebidas Calientes', description: 'Espresso suave con una generosa cantidad de leche vaporizada.', variable_price: false, active: true },
    { id: 'm7', name: 'Mocaccino', price: 15.00, category: 'Bebidas Calientes', description: 'Deliciosa mezcla de espresso, chocolate y leche vaporizada.', variable_price: false, active: true },
    { id: 'm8', name: 'Vanilla Latte', price: 15.00, category: 'Bebidas Calientes', description: 'Tu latte favorito con un toque dulce de vainilla.', variable_price: false, active: true },
    { id: 'm9', name: 'Spanish Coffee', price: 15.00, category: 'Bebidas Calientes', description: 'Una versión especial de café con leche, con notas dulces.', variable_price: false, active: true },
    { id: 'm10', name: 'Chocolate Caliente', price: 15.00, category: 'Bebidas Calientes', description: 'Intenso y cremoso chocolate caliente.', variable_price: false, active: true },
    { id: 'm11', name: 'Affogato', price: 18.00, category: 'Bebidas Calientes', description: 'Bola de helado de vainilla "ahogada" en espresso caliente.', variable_price: false, active: true },
    { id: 'm12', name: 'Matcha Latte Caliente', price: 20.00, category: 'Bebidas Calientes', description: 'Suave mezcla de té matcha japonés con leche vaporizada, de sabor delicado y ligeramente herbal.', variable_price: false, active: true },

    // Bebidas Frías
    { id: 'm13', name: 'Iced Tea', price: 16.00, category: 'Bebidas Frías', description: 'Té frío refrescante, ligeramente endulzado y servido con hielo.', variable_price: false, active: true },
    { id: 'm14', name: 'Iced Latte', price: 16.00, category: 'Bebidas Frías', description: 'Espresso con leche fría, servido sobre hielo.', variable_price: false, active: true },
    { id: 'm15', name: 'Iced Mocaccino Latte', price: 16.00, category: 'Bebidas Frías', description: 'Versión fría de nuestro mocaccino, con chocolate y espresso.', variable_price: false, active: true },
    { id: 'm16', name: 'Iced Caramel Latte', price: 16.00, category: 'Bebidas Frías', description: 'Latte frío con un rico toque de dulce de leche.', variable_price: false, active: true },
    { id: 'm17', name: 'Iced Vanilla Latte', price: 16.00, category: 'Bebidas Frías', description: 'Refrescante latte frío con esencia de vainilla.', variable_price: false, active: true },
    { id: 'm18', name: 'Espresso Orange', price: 16.00, category: 'Bebidas Frías', description: 'Espresso con un toque de jugo de naranja.', variable_price: false, active: true },
    { id: 'm19', name: 'Iced Matcha Latte', price: 26.00, category: 'Bebidas Frías', description: 'Refrescante combinación de matcha con leche fría, ligeramente dulce y servido sobre hielo.', variable_price: false, active: true },

    // Té
    { id: 'm20', name: 'Té clásico', price: 12.00, category: 'Té', description: 'Té clásico caliente.', variable_price: false, active: true },
    { id: 'm21', name: 'Té de frutos rojos', price: 12.00, category: 'Té', description: 'Té caliente con sabor a frutos rojos.', variable_price: false, active: true },
    { id: 'm22', name: 'Té de manzanilla / trimate', price: 12.00, category: 'Té', description: 'Infusión caliente de manzanilla o trimate.', variable_price: false, active: true },
    { id: 'm23', name: 'Té de piña', price: 12.00, category: 'Té', description: 'Infusión caliente sabor a piña.', variable_price: false, active: true },

    // Frappes
    { id: 'm24', name: 'Frappuccino', price: 23.00, category: 'Frappes', description: 'Frappé de café frappuccino con leche.', variable_price: false, active: true },
    { id: 'm25', name: 'Frappé Durazno (Leche)', price: 25.00, category: 'Frappes', description: 'Frappé de durazno con leche.', variable_price: false, active: true },
    { id: 'm26', name: 'Frappé Mocca', price: 23.00, category: 'Frappes', description: 'Frappé mocca con café, chocolate y leche.', variable_price: false, active: true },
    { id: 'm27', name: 'Frappé Caramel', price: 23.00, category: 'Frappes', description: 'Frappé de café caramel con leche.', variable_price: false, active: true },
    { id: 'm28', name: 'Frappé Oreo', price: 26.00, category: 'Frappes', description: 'Delicioso frappé con galletas Oreo y leche.', variable_price: false, active: true },
    { id: 'm29', name: 'Frappé Frutos Rojos (Leche)', price: 25.00, category: 'Frappes', description: 'Frappé de frutos rojos con leche.', variable_price: false, active: true },
    { id: 'm30', name: 'Frappé Pie de Limón', price: 25.00, category: 'Frappes', description: 'Novedoso frappé con sabor a pie de limón con leche.', variable_price: false, active: true },
    { id: 'm31', name: 'Frappé Frutos Rojos (Agua)', price: 20.00, category: 'Frappes', description: 'Frappé de frutos rojos a base de agua.', variable_price: false, active: true },
    { id: 'm32', name: 'Frappé Durazno (Agua)', price: 20.00, category: 'Frappes', description: 'Frappé de durazno a base de agua.', variable_price: false, active: true },

    // Cócteles
    { id: 'm33', name: 'Mojito', price: 25.00, category: 'Cócteles', description: 'Con hierba buena.', variable_price: false, active: true },
    { id: 'm34', name: 'Mojito de Frutilla', price: 25.00, category: 'Cócteles', description: 'Con toques de fruta natural.', variable_price: false, active: true },
    { id: 'm35', name: 'Café Irlandés', price: 25.00, category: 'Cócteles', description: 'Café caliente con un toque de whisky irlandés, azúcar y una capa de crema suave.', variable_price: false, active: true },
    { id: 'm36', name: 'Daiquiri de Frutilla', price: 25.00, category: 'Cócteles', description: 'Bebida frappeada de Frutilla con toques de fruta natural.', variable_price: false, active: true },

    // Bebidas Variadas
    { id: 'm37', name: 'Limoncello', price: 17.00, category: 'Bebidas Variadas', description: 'Bebida de limón italiana refrescante.', variable_price: false, active: true },
    { id: 'm38', name: 'Piña con hierba buena', price: 17.00, category: 'Bebidas Variadas', description: 'Licuado o infusión de piña con hierba buena.', variable_price: false, active: true },

    // Açaí
    { id: 'm_acai', name: 'Açaí', price: 0.00, category: 'Açaí', description: 'Açaí con toppings (precio variable según adiciones).', variable_price: true, active: true },

    // Panadería
    { id: 'm39', name: 'Cuñapé', price: 8.00, category: 'Panadería', description: 'Panecillo de queso tradicional hecho con almidón de yuca.', variable_price: false, active: true },
    { id: 'm40', name: 'Galletas Crumble Cookies', price: 12.00, category: 'Panadería', description: 'Crujientes por fuera, suaves por dentro.', variable_price: false, active: true },
    { id: 'm41', name: 'Cinnamon Roll', price: 15.00, category: 'Panadería', description: 'Rollo de canela con glaseado.', variable_price: false, active: true },
    { id: 'm42', name: 'Panini', price: 18.00, category: 'Panadería', description: 'Sándwich caliente con jamón y queso en pan de masa madre, prensado y dorado, con relleno suave y balanceado, ideal para acompañar tu café.', variable_price: false, active: true },
    { id: 'm43', name: 'Pizzanini', price: 20.00, category: 'Panadería', description: 'Mini pizza elaborada con masa madre, base crujiente y ligera, cubierta con salsa de tomate, orégano, jamón y queso gratinado.', variable_price: false, active: true },
    { id: 'm44', name: 'Sándwich de croissant Salado', price: 25.00, category: 'Panadería', description: 'Croissant, hojaldrado y crujiente, relleno con doble jamón y doble queso fundido, con toques de tomate cherry, ligeramente tostado para resaltar su sabor.', variable_price: false, active: true },
    { id: 'm45', name: 'Sándwich de croissant Dulce', price: 25.00, category: 'Panadería', description: 'Croissant, hojaldrado y crujiente, relleno con dulce de leche, crema y duraznos frescos picados, ligeramente tostado para realzar su dulzura y sabor.', variable_price: false, active: true },
    { id: 'm46', name: 'Creppes', price: 25.00, category: 'Panadería', description: 'Delicada masa francesa preparada al momento, servida con fruta fresca de temporada, una porción de helado, crema, jaleas y toppings seleccionados.', variable_price: false, active: true },
    { id: 'm47', name: 'Waffles', price: 25.00, category: 'Panadería', description: 'Waffle artesanal recién horneado, acompañado de fruta fresca de temporada, una porción de helado, crema, jaleas y toppings seleccionados.', variable_price: false, active: true },
    { id: 'm48', name: 'Panqueques', price: 25.00, category: 'Panadería', description: 'Esponjosos panqueques recién preparados, servidos con fruta fresca de temporada, una porción de helado, crema, jaleas y toppings seleccionados.', variable_price: false, active: true },

    // Extras
    { id: 'm49', name: 'Espresso (Extra)', price: 3.00, category: 'Extras', description: 'Shot de espresso adicional.', variable_price: false, active: true },
    { id: 'm50', name: 'Crema (Extra)', price: 6.00, category: 'Extras', description: 'Crema batida o crema adicional.', variable_price: false, active: true },
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
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const checkout = async (
        paymentMethod: 'efectivo' | 'QR' | 'tarjeta' | 'pendiente', 
        customerName?: string, 
        paymentStatus: 'pagado' | 'pendiente' = 'pagado',
        cashReceived?: number,
        changeReturned?: number
    ) => {
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
                cash_received: cashReceived ?? null,
                change_returned: changeReturned ?? null,
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
            cash_received: cashReceived,
            change_returned: changeReturned,
        };

        const success = await saveOrder(newOrder);
        if (success) {
            clearCart();
            await refreshOpenOrders();
        }
        return success;
    };

    const checkoutSplit = async (
        paymentMethod: 'efectivo' | 'QR' | 'tarjeta',
        customerName: string,
        paidItems: OrderItem[],
        remainingItems: OrderItem[],
        cashReceived?: number,
        changeReturned?: number
    ) => {
        if (paidItems.length === 0) return false;
        
        const paidTotal = paidItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // 1. Create a new completed order for the paid portion
        const newOrder: Order = {
            customer_name: `${customerName} (Parte)`,
            payment_method: paymentMethod,
            payment_status: 'pagado',
            total: paidTotal,
            status: 'entregado',
            items: paidItems,
            cash_received: cashReceived,
            change_returned: changeReturned,
        };
        
        const success = await saveOrder(newOrder);
        if (!success) {
            return false;
        }
        
        // 2. Handle original order update / deletion
        if (activeOrderId) {
            const { supabase } = await import('./supabase/client');
            
            // Check if there are remaining items left
            const hasRemaining = remainingItems.length > 0 && remainingItems.some(i => i.quantity > 0);
            
            if (hasRemaining) {
                // Update the existing order in database
                const remainingTotal = remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                const { error: orderError } = await supabase.from('orders').update({
                    total: remainingTotal,
                }).eq('id', activeOrderId);
                
                if (orderError) {
                    console.error("Error updating original order in split", orderError);
                }
                
                // Delete old items and insert remaining items
                await supabase.from('order_items').delete().eq('order_id', activeOrderId);
                const itemsToInsert = remainingItems.map((item) => ({
                    order_id: activeOrderId,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.notes,
                }));
                await supabase.from('order_items').insert(itemsToInsert);
                
                // Update cart in memory
                setCart(remainingItems);
            } else {
                // Delete the original order as it is fully paid
                const { error: deleteError } = await supabase.from('orders').delete().eq('id', activeOrderId);
                if (deleteError) {
                    console.error("Error deleting completed order in split", deleteError);
                }
                
                clearCart();
            }
        } else {
            // It was a local new order (unsaved to DB yet), just update cart in memory
            const hasRemaining = remainingItems.length > 0 && remainingItems.some(i => i.quantity > 0);
            if (hasRemaining) {
                setCart(remainingItems);
            } else {
                clearCart();
            }
        }
        
        await refreshOpenOrders();
        return true;
    };

    return (
        <PosContext.Provider value={{
            products, categories, selectedCategory, setSelectedCategory,
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, checkout, checkoutSplit,
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
