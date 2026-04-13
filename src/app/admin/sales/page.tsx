"use client"
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Order } from '@/lib/types';
import { Trash2, AlertCircle, Calendar, Receipt, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminSales() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<Record<string, any[]>>({});

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        // Load recent 100 orders
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (data && !error) {
            setOrders(data as Order[]);
        }
    }

    async function toggleOrderDetails(orderId: string) {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            return;
        }

        setExpandedOrder(orderId);

        if (!orderDetails[orderId]) {
            const { data } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (data) {
                setOrderDetails(prev => ({ ...prev, [orderId]: data }));
            }
        }
    }

    async function deleteOrder(orderId: string) {
        const confirmDelete = window.confirm("¿Seguro que deseas ELIMINAR esta venta? Esta acción borrará el registro y actualizará la caja de hoy.");
        if (!confirmDelete) return;

        // Thanks to ON DELETE CASCADE on order_items, deleting the order deletes its items
        const { error } = await supabase.from('orders').delete().eq('id', orderId);

        if (error) {
            alert("Error al eliminar la venta.");
            console.error(error);
        } else {
            // Remove from state
            setOrders(orders.filter(o => o.id !== orderId));
            alert("Venta eliminada exitosamente.");
        }
    }

    return (
        <div className="min-h-[100dvh] flex flex-col md:flex-row text-on-surface" style={{ background: 'var(--color-surface)' }}>
            <AdminSidebar active="sales" />

            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>Historial de Ventas</h2>
                        <p className="opacity-70 mt-1 md:mt-2 text-base md:text-lg">Revisa los últimos pedidos o elimina ventas registradas por error.</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl text-center border border-ghost shadow-ambient">
                            <Receipt className="mx-auto mb-4 opacity-20" size={48} />
                            <h3 className="font-bold text-xl opacity-50">No hay ventas registradas aún.</h3>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-ghost overflow-hidden transition-all hover:shadow-ambient">
                                <div
                                    className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none relative"
                                    onClick={() => toggleOrderDetails(order.id!)}
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-display font-black">
                                            {order.customer_name ? order.customer_name.substring(0, 2).toUpperCase() : 'BCA'}
                                            {!order.customer_name && <Receipt size={20} className="opacity-50" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{order.customer_name || 'Cliente sin nombre'}</h3>
                                            <div className="flex items-center gap-2 mt-1 opacity-60 text-sm font-medium">
                                                <Calendar size={14} />
                                                <span>{new Date(order.created_at!).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                <span className="hidden md:inline">•</span>
                                                <strong className="uppercase bg-black/10 px-2 py-0.5 rounded-full text-[10px] tracking-wider">{order.payment_method}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                        <div className="text-left md:text-right">
                                            <div className="text-sm opacity-60 font-medium md:hidden mb-1">Total Cobrado</div>
                                            <span className="font-display font-bold text-2xl tracking-tighter" style={{ color: 'var(--color-primary)' }}>
                                                Bs. {Number(order.total).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteOrder(order.id!); }}
                                                className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                                title="Eliminar Venta"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            <div className="p-2 opacity-50">
                                                {expandedOrder === order.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                    <div className="bg-black/5 border-t border-ghost p-4 md:p-6 pb-6">
                                        <h4 className="font-bold text-sm opacity-60 uppercase tracking-widest mb-4">Detalle del Pedido</h4>
                                        <ul className="space-y-3">
                                            {orderDetails[order.id!] ? (
                                                orderDetails[order.id!].map(item => (
                                                    <li key={item.id} className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-ghost/50">
                                                        <div>
                                                            <strong className="text-lg block leading-tight">{item.quantity}x {item.product_name}</strong>
                                                            {item.notes && <span className="text-sm opacity-60 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">{item.notes}</span>}
                                                        </div>
                                                        <span className="font-bold whitespace-nowrap">Bs. {(item.price * item.quantity).toFixed(2)}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-center p-4 opacity-50 font-medium animate-pulse">Cargando detalles...</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
