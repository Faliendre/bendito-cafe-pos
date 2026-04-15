export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    variable_price: boolean;
    active: boolean;
    created_at?: string;
}

export interface OrderItem {
    id?: string;
    product_id?: string;
    product_name: string;
    price: number;
    quantity: number;
    notes?: string;
}

export interface Order {
    id?: string;
    customer_name?: string;
    payment_method: 'efectivo' | 'QR' | 'tarjeta' | 'pendiente';
    payment_status?: 'pagado' | 'pendiente';
    total: number;
    status: 'pendiente' | 'preparando' | 'listo' | 'entregado';
    created_at?: string;
    items: OrderItem[];
}

export interface UnsyncedOrder extends Order {
    local_id: string;
    sync_status: 'pending' | 'failed';
}
