"use client"
import React, { useState } from 'react';
import { usePos } from '@/lib/pos-context';
import { Minus, Plus, Trash2, CreditCard, Banknote, QrCode } from 'lucide-react';

export function OrderSummary() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, checkout, activeOrderId, openOrders, showMessage, selectedCategory } = usePos();
    const [customerName, setCustomerName] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'QR' | 'tarjeta' | null>(null);
    const [cashReceived, setCashReceived] = useState<string>('');

    const cashReceivedNum = parseFloat(cashReceived) || 0;
    const changeToReturn = cashReceivedNum >= cartTotal ? cashReceivedNum - cartTotal : 0;
    const isCashValid = cashReceivedNum >= cartTotal;

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
        const received = method === 'efectivo' ? cashReceivedNum : undefined;
        const change = method === 'efectivo' ? changeToReturn : undefined;
        const success = await checkout(method, customerName, 'pagado', received, change);
        setIsProcessing(false);
        if (success) {
            setShowPayment(false);
            setPaymentMethod(null);
            setCashReceived('');
            setCustomerName('');
            showMessage("Pago Exitoso", "La venta se ha registrado correctamente.", "success");
        } else {
            showMessage("Error", "No se pudo procesar el pago. Por favor intenta de nuevo.", "error");
        }
    };

    return (
        <div className="w-full h-full flex flex-col" style={{ background: 'var(--color-surface-container-highest)' }}>
            {/* Header */}
            <div className="p-6 pb-4">
                <h2 className="font-display text-2xl font-bold tracking-tight mb-4 text-on-surface">Orden Actual</h2>
                
                {activeOrderId && selectedCategory === 'Mesas Abiertas' && (
                    <div className="mb-4 p-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-pulse">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold">Mesa Activa: {customerName || 'Sin Nombre'}</span>
                            <span className="text-[10px] opacity-70">Para editar, selecciona un producto del menú</span>
                        </div>
                    </div>
                )}

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
                    <button onClick={clearCart} className="flex-1 py-4 font-bold rounded-xl border border-ghost active:scale-95 transition-transform text-[10px] sm:text-xs md:text-lg">
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            if (cartTotal > 0) {
                                if (!customerName.trim()) {
                                    showMessage("Falta información", "Por favor, ingresa el nombre del cliente o número de mesa para dejar la cuenta abierta.", "warning");
                                    return;
                                }
                                setIsProcessing(true);
                                const success = await checkout('pendiente', customerName, 'pendiente');
                                setIsProcessing(false);
                                if (success) {
                                    setCustomerName('');
                                    showMessage("Cuenta Guardada", "La cuenta se ha guardado como abierta correctamente.", "success");
                                } else {
                                    showMessage("Error", "No se pudo guardar la cuenta. Por favor intenta de nuevo.", "error");
                                }
                            }
                        }}
                        disabled={cart.length === 0 || isProcessing}
                        className={`flex-1 py-4 rounded-xl font-bold text-[10px] sm:text-xs md:text-lg transition-all ${cart.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-95'}`}
                    >
                        Mesa / Abierta
                    </button>
                    <button
                        onClick={() => cartTotal > 0 && setShowPayment(true)}
                        disabled={cart.length === 0 || isProcessing}
                        className={`flex-[1.2] py-4 rounded-xl font-bold text-[10px] sm:text-xs md:text-lg text-white transition-all ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'btn-primary active:scale-95'}`}
                    >
                        Cobrar
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center glass-panel p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-ambient flex flex-col" style={{ background: 'var(--color-surface-container-highest)' }}>
                        {paymentMethod === null ? (
                            <>
                                <h3 className="font-display text-3xl font-bold mb-2 text-center text-on-surface">Método de Pago</h3>
                                <p className="text-center opacity-70 mb-8 text-lg">Monto total: <strong className="text-black">Bs. {cartTotal.toFixed(2)}</strong></p>

                                <div className="space-y-4 mb-8">
                                    <button 
                                        onClick={() => setPaymentMethod('efectivo')} 
                                        disabled={isProcessing} 
                                        className="w-full flex items-center p-5 rounded-2xl border border-ghost hover:border-black hover:bg-black/[0.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        <Banknote className="mr-4 text-green-600 animate-pulse" size={32} />
                                        <span className="font-bold text-xl flex-1 text-left">Efectivo</span>
                                    </button>
                                    <button 
                                        onClick={() => handleCheckout('tarjeta')} 
                                        disabled={isProcessing} 
                                        className="w-full flex items-center p-5 rounded-2xl border border-ghost hover:border-black hover:bg-black/[0.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        <CreditCard className="mr-4 text-blue-600" size={32} />
                                        <span className="font-bold text-xl flex-1 text-left">Tarjeta</span>
                                    </button>
                                    <button 
                                        onClick={() => handleCheckout('QR')} 
                                        disabled={isProcessing} 
                                        className="w-full flex items-center p-5 rounded-2xl border border-ghost hover:border-black hover:bg-black/[0.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        <QrCode className="mr-4 text-black" size={32} />
                                        <span className="font-bold text-xl flex-1 text-left">QR Simple</span>
                                    </button>
                                </div>

                                <button 
                                    onClick={() => { setShowPayment(false); setPaymentMethod(null); setCashReceived(''); }} 
                                    disabled={isProcessing} 
                                    className="w-full py-4 text-center font-bold text-lg opacity-60 hover:opacity-100 cursor-pointer"
                                >
                                    Volver
                                </button>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="font-display text-2xl font-bold mb-1 text-on-surface">Cobro en Efectivo</h3>
                                    <p className="opacity-70 text-sm">Total a cobrar: <strong className="text-black">Bs. {cartTotal.toFixed(2)}</strong></p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-wider opacity-70">Efectivo Recibido</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg opacity-60">Bs.</span>
                                        <input
                                            type="number"
                                            step="0.10"
                                            placeholder="0.00"
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-ghost shadow-sm focus:outline-none text-xl font-bold text-black"
                                            style={{ background: 'var(--color-surface-container-lowest)' }}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Suggestion Pills */}
                                <div className="space-y-2">
                                    <span className="block text-[10px] font-black uppercase tracking-wider opacity-50">Billetes comunes:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setCashReceived(cartTotal.toFixed(2))}
                                            className="px-3 py-2 rounded-xl border border-ghost hover:border-black font-bold text-xs bg-black/5 hover:bg-black/10 active:scale-95 transition-transform cursor-pointer"
                                        >
                                            Exacto
                                        </button>
                                        {[10, 20, 50, 100, 200].map(bill => (
                                            <button
                                                key={bill}
                                                type="button"
                                                onClick={() => setCashReceived(bill.toString())}
                                                className="px-3 py-2 rounded-xl border border-ghost hover:border-black font-bold text-xs bg-white hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer"
                                            >
                                                {bill} Bs.
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Results display */}
                                {cashReceivedNum > 0 && (
                                    <div className={`p-4 rounded-2xl border transition-colors ${isCashValid ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                                        {isCashValid ? (
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm">Cambio a devolver:</span>
                                                <span className="font-display font-black text-2xl">Bs. {changeToReturn.toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <p className="text-xs font-bold text-center">
                                                El monto ingresado es menor al total de la venta. Falta: Bs. {(cartTotal - cashReceivedNum).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4 border-t border-ghost">
                                    <button
                                        type="button"
                                        onClick={() => { setPaymentMethod(null); setCashReceived(''); }}
                                        className="flex-1 py-4 font-bold rounded-xl border border-ghost text-sm hover:bg-black/5 transition-colors cursor-pointer"
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => isCashValid && handleCheckout('efectivo')}
                                        disabled={!isCashValid || isProcessing}
                                        className={`flex-[1.5] py-4 rounded-xl font-bold text-sm text-white transition-all cursor-pointer ${!isCashValid || isProcessing ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'btn-primary active:scale-95 shadow-ambient'}`}
                                    >
                                        Confirmar Cobro
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
