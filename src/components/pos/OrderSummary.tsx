"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { Minus, Plus, Trash2, CreditCard, Banknote, QrCode } from 'lucide-react';

export function OrderSummary() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, checkout, activeOrderId, openOrders } = usePos();
    const [customerName, setCustomerName] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    React.useEffect(() => {
        if (activeOrderId) {
            const order = openOrders?.find(o => o.id === activeOrderId);
            if (order && order.customer_name) {
                setCustomerName(order.customer_name);
            }
        } else {
            setCustomerName('');
        }
    }, [activeOrderId, openOrders]);

    const handleCheckout = async (method: 'efectivo' | 'QR' | 'tarjeta') => {
        setIsProcessing(true);
        const success = await checkout(method, customerName);
        setIsProcessing(false);
        if (success) {
            setShowPayment(false);
            setCustomerName('');
        } else {
            alert("Error procesando pago. Intente de nuevo.");
        }
    };

    return (
        <div className="w-80 lg:w-96 h-full flex flex-col" style={{ background: 'var(--color-surface-container-highest)' }}>
            {/* Header */}
            <div className="p-6 pb-4">
                <h2 className="font-display text-2xl font-bold tracking-tight mb-4">Orden Actual</h2>
                <input
                    type="text"
                    placeholder="Nombre del cliente o mesa..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-ghost focus:outline-none"
                    style={{ background: 'var(--color-surface-container-lowest)' }}
                />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 space-y-6">
                {cart.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center opacity-50">
                        <p className="font-medium text-lg">No hay productos en la orden.</p>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <div key={idx} className="flex flex-col py-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-2">
                                    <h4 className="font-bold text-lg leading-tight">{item.product_name}</h4>
                                    {item.notes && <p className="text-sm opacity-70 mt-1 leading-snug">{item.notes}</p>}
                                </div>
                                <span className="font-bold whitespace-nowrap text-lg">Bs. {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="p-2 rounded-full bg-white shadow-sm border border-ghost hover:bg-gray-50 active:scale-95">
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold w-4 text-center text-lg">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="p-2 rounded-full bg-white shadow-sm border border-ghost hover:bg-gray-50 active:scale-95">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button onClick={() => removeFromCart(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Area */}
            <div className="p-6 pt-4 rounded-t-3xl shadow-ambient" style={{ background: 'var(--color-surface-container-lowest)' }}>
                <div className="flex justify-between items-end mb-6">
                    <span className="text-lg font-medium opacity-70">Total a cobrar</span>
                    <span className="font-display text-4xl font-bold tracking-tighter" style={{ color: 'var(--color-primary)' }}>
                        Bs. {cartTotal.toFixed(2)}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button onClick={clearCart} className="flex-1 py-3 md:py-4 font-bold rounded-xl border border-ghost active:scale-95 transition-transform text-sm md:text-lg">
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            if (cartTotal > 0) {
                                if (!customerName.trim()) {
                                    alert("Por favor, ingresa un nombre o número de mesa para dejar la cuenta abierta.");
                                    return;
                                }
                                setIsProcessing(true);
                                const success = await checkout('pendiente', customerName, 'pendiente');
                                setIsProcessing(false);
                                if (success) setCustomerName('');
                                else alert("Error procesando pago. Intente de nuevo.");
                            }
                        }}
                        disabled={cart.length === 0 || isProcessing}
                        className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg transition-all ${cart.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-95'}`}
                    >
                        Mesa / Abierta
                    </button>
                    <button
                        onClick={() => cartTotal > 0 && setShowPayment(true)}
                        disabled={cart.length === 0 || isProcessing}
                        className={`flex-[1.2] py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg text-white transition-all ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'btn-primary active:scale-95'}`}
                    >
                        Cobrar
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center glass-panel p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-ambient flex flex-col">
                        <h3 className="font-display text-3xl font-bold mb-2 text-center">Método de Pago</h3>
                        <p className="text-center opacity-70 mb-8 text-lg">Monto total: <strong className="text-black">Bs. {cartTotal.toFixed(2)}</strong></p>

                        <div className="space-y-4 mb-8">
                            <button onClick={() => handleCheckout('efectivo')} disabled={isProcessing} className="w-full flex items-center p-5 rounded-2xl border border-ghost hover:border-black transition-colors">
                                <Banknote className="mr-4 text-green-600" size={32} />
                                <span className="font-bold text-xl flex-1 text-left">Efectivo</span>
                            </button>
                            <button onClick={() => handleCheckout('tarjeta')} disabled={isProcessing} className="w-full flex items-center p-5 rounded-2xl border border-ghost hover:border-black transition-colors">
                                <CreditCard className="mr-4 text-blue-600" size={32} />
                                <span className="font-bold text-xl flex-1 text-left">Tarjeta</span>
                            </button>
                            <button onClick={() => handleCheckout('QR')} disabled={isProcessing} className="w-full flex items-center p-5 rounded-2xl border border-ghost hover:border-black transition-colors">
                                <QrCode className="mr-4 text-black" size={32} />
                                <span className="font-bold text-xl flex-1 text-left">QR Simple</span>
                            </button>
                        </div>

                        <button onClick={() => setShowPayment(false)} disabled={isProcessing} className="w-full py-4 text-center font-bold text-lg opacity-60 hover:opacity-100">
                            Volver
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
