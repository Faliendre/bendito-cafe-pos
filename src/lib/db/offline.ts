import localforage from 'localforage';
import { UnsyncedOrder, Order, Product } from '../types';
import { supabase } from '../supabase/client';

// Initialize local stores
const ordersStore = localforage.createInstance({
    name: 'BenditoPOS',
    storeName: 'unsynced_orders',
});

const cacheStore = localforage.createInstance({
    name: 'BenditoPOS',
    storeName: 'cache_data',
});

// Helper for unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Sync Logic
export async function syncOfflineOrders() {
    if (!navigator.onLine) return; // Only sync if online

    const keys = await ordersStore.keys();
    if (keys.length === 0) return;

    for (const key of keys) {
        const order: UnsyncedOrder | null = await ordersStore.getItem(key);
        if (!order) continue;

        try {
            // 1. Insert order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: order.customer_name,
                    payment_method: order.payment_method,
                    payment_status: order.payment_status || 'pagado',
                    total: order.total,
                    status: order.status,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert items
            const itemsToInsert = order.items.map((item) => ({
                order_id: orderData.id,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                notes: item.notes,
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // 3. Delete from local store if successful
            await ordersStore.removeItem(key);
        } catch (error) {
            console.error('Failed to sync order:', key, error);
            // Update status to failed
            await ordersStore.setItem(key, { ...order, sync_status: 'failed' });
        }
    }
}

export async function saveOrder(order: Order): Promise<boolean> {
    if (navigator.onLine) {
        try {
            // Direct save to Supabase
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: order.customer_name,
                    payment_method: order.payment_method,
                    payment_status: order.payment_status || 'pagado',
                    total: order.total,
                    status: order.status,
                })
                .select()
                .single();
            if (orderError) throw orderError;

            const itemsToInsert = order.items.map((item) => ({
                order_id: orderData.id,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                notes: item.notes,
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;
            return true;
        } catch (e) {
            console.error('Online save failed, falling back to offline', e);
            // Fallback
        }
    }

    // Offline Save
    const localId = generateId();
    const unsynced: UnsyncedOrder = {
        ...order,
        local_id: localId,
        sync_status: 'pending',
    };
    await ordersStore.setItem(localId, unsynced);

    // Register sync for later if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((swRegistration) => {
            // @ts-expect-error SyncManager is not in all TS dom defs
            return swRegistration.sync.register('sync-orders');
        }).catch(console.error);
    }

    return true;
}

// Product cache for offline usage
export async function getProducts(): Promise<Product[]> {
    let dataFromDb: Product[] | null = null;

    try {
        if (navigator.onLine) {
            const { data, error } = await supabase.from('products').select('*').eq('active', true);
            if (!error && data) {
                dataFromDb = data as Product[];
                try {
                    await cacheStore.setItem('products', dataFromDb);
                } catch (e) { console.warn("LocalForage setItem error", e); }
                return dataFromDb;
            }
        }
    } catch (error) {
        console.error('Failed fetching products online', error);
    }

    // Fallback to local cache
    try {
        const cachedProducts = await cacheStore.getItem<Product[]>('products');
        return cachedProducts || [];
    } catch (error) {
        console.error('Failed fetching products from cache', error);
        return [];
    }
}
