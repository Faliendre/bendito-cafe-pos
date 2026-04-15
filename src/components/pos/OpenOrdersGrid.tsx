"use client"
import React, { useEffect } from 'react';
import { usePos } from '@/lib/pos-context';
import { Receipt, Clock, User, PlusCircle } from 'lucide-react';

export function OpenOrdersGrid() {
    const { openOrders, refreshOpenOrders, loadOrderIntoCart, showConfirm } = usePos();

    useEffect(() => {
        refreshOpenOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelect = async (order: any) => {
        const confirmed = await showConfirm(
            "Abrir Cuenta",
            `¿Deseas cargar la orden de ${order.customer_name || 'este cliente'} para editarla o cobrarla?`
        );
        if (confirmed) {
            loadOrderIntoCart(order);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-display font-semibold tracking-tight">Cuentas Abiertas</h2>
                    <p className="opacity-70 mt-1">Órdenes pendientes de pago ({openOrders.length})</p>
                </div>
                <button
                    onClick={refreshOpenOrders}
                    className="p-2 border border-ghost rounded-lg hover:bg-black/5 active:scale-95 transition-all text-sm font-semibold"
                >
                    Actualizar
                </button>
            </div>

            {openOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-ghost rounded-3xl">
                    <Receipt size={48} className="mb-4 opacity-50" />
                    <h3 className="font-display font-semibold text-xl">No hay cuentas abiertas</h3>
                    <p>Las órdenes enviadas a cocina sin pagar aparecerán aquí.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {openOrders.map(order => (
                        <button
                            key={order.id}
                            onClick={() => handleSelect(order)}
                            className="flex flex-col items-start p-5 rounded-2xl bg-white shadow-sm border border-orange-100 hover:shadow-ambient hover:border-orange-300 transform transition-transform active:scale-95"
                        >
                            <div className="w-full flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                        <User size={20} />
                                    </div>
                                    <span className="font-bold text-lg text-left">{order.customer_name || 'Sin Nombre'}</span>
                                </div>
                                <span className="font-bold text-xl text-orange-600">Bs. {order.total.toFixed(2)}</span>
                            </div>

                            <div className="w-full relative py-2">
                                <div className="text-sm font-medium opacity-70 mb-1 flex items-center gap-1">
                                    <ShoppingCart size={14} /> {order.items?.length || 0} productos
                                </div>
                                <div className="text-xs opacity-50 truncate w-full text-left">
                                    {order.items?.map((item: any) => `${item.quantity}x ${item.product_name}`).join(', ')}
                                </div>
                            </div>

                            <div className="w-full flex justify-between items-center mt-4 pt-4 border-t border-ghost/50">
                                <div className="flex items-center gap-1 text-xs opacity-60 font-medium">
                                    <Clock size={12} />
                                    {new Date(order.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                                    <PlusCircle size={16} /> Modificar
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// simple shoppingcart icon mock
import { ShoppingCart } from 'lucide-react';
