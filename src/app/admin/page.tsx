"use client"
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { BarChart, ArrowUpRight, DollarSign, Package, CreditCard, Banknote, QrCode } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [paymentFilter, setPaymentFilter] = useState<'todo' | 'hoy' | 'semana' | 'mes' | 'año'>('todo');

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data, error } = await supabase.from('orders').select('*');
                if (data && !error) {
                    setOrders(data);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchStats();
    }, []);

    const stats = useMemo(() => {
        let today = 0, week = 0, month = 0, yearTotal = 0, total = 0;
        orders.forEach(o => {
            const amount = Number(o.total);
            const date = o.created_at ? parseISO(o.created_at) : new Date();

            total += amount;
            if (isToday(date)) today += amount;
            if (isThisWeek(date)) week += amount;
            if (isThisMonth(date)) month += amount;
            if (date.getFullYear() === new Date().getFullYear()) yearTotal += amount;
        });
        return { today, week, month, year: yearTotal, total };
    }, [orders]);

    const activePaymentStats = useMemo(() => {
        let e = 0, q = 0, c = 0;
        orders.forEach(o => {
            const amount = Number(o.total);
            const date = o.created_at ? parseISO(o.created_at) : new Date();

            let include = false;
            switch (paymentFilter) {
                case 'hoy': include = isToday(date); break;
                case 'semana': include = isThisWeek(date); break;
                case 'mes': include = isThisMonth(date); break;
                case 'año': include = date.getFullYear() === new Date().getFullYear(); break;
                case 'todo': default: include = true; break;
            }

            if (include) {
                if (o.payment_method === 'efectivo') e += amount;
                if (o.payment_method === 'QR') q += amount;
                if (o.payment_method === 'tarjeta') c += amount;
            }
        });
        return { efectivo: e, QR: q, tarjeta: c };
    }, [orders, paymentFilter]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row text-on-surface" style={{ background: 'var(--color-surface)' }}>
            <AdminSidebar active="dashboard" />

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <header className="mb-12">
                    <h2 className="font-display text-4xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>Resumen de Ventas</h2>
                    <p className="opacity-70 mt-2 text-lg">Métricas de rendimiento de tu cafetería</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Ventas Hoy" value={`Bs. ${stats.today.toFixed(2)}`} icon={<DollarSign />} trend={stats.today > 0 ? "+ Activo" : undefined} />
                    <StatCard title="Esta Semana" value={`Bs. ${stats.week.toFixed(2)}`} icon={<BarChart />} />
                    <StatCard title="Este Mes" value={`Bs. ${stats.month.toFixed(2)}`} icon={<BarChart />} />
                    <StatCard title="Total Acumulado" value={`Bs. ${stats.total.toFixed(2)}`} icon={<ArrowUpRight />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section (Simulated) */}
                    <div className="lg:col-span-2 p-8 rounded-3xl shadow-ambient border-ghost border" style={{ background: 'var(--color-surface-container-lowest)' }}>
                        <h3 className="font-display text-2xl font-bold mb-8">Ingresos Últimos 7 Días</h3>
                        <div className="h-64 flex items-end gap-4">
                            {[0, 0, 0, 0, 0, 0, stats.today].map((h, i) => {
                                const heightPercent = stats.total > 0 ? Math.max((h / stats.total) * 100, 10) : 10;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="w-full rounded-t-xl relative group overflow-hidden" style={{ background: 'var(--color-secondary-container)', height: '100%' }}>
                                            <div className="absolute bottom-0 w-full transition-all duration-500 rounded-t-xl" style={{ height: `${heightPercent}%`, background: 'var(--color-primary)' }}></div>
                                        </div>
                                        <span className="text-sm opacity-60 font-bold">Día {i + 1}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="p-8 rounded-3xl shadow-ambient border-ghost border flex flex-col" style={{ background: 'var(--color-surface-container-lowest)' }}>
                        <div className="flex justify-between items-center mb-8 gap-2">
                            <h3 className="font-display text-2xl font-bold flex-1">Por Método de Pago</h3>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value as any)}
                                className="p-2 px-3 rounded-xl text-sm font-bold border border-ghost focus:outline-none cursor-pointer"
                                style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                            >
                                <option value="todo">General</option>
                                <option value="hoy">Hoy</option>
                                <option value="semana">Semana</option>
                                <option value="mes">Mes</option>
                                <option value="año">Año</option>
                            </select>
                        </div>
                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <PaymentRow method="Efectivo" total={activePaymentStats.efectivo} icon={<Banknote />} color="text-green-700" />
                            <PaymentRow method="QR" total={activePaymentStats.QR} icon={<QrCode />} color="text-black" />
                            <PaymentRow method="Tarjeta" total={activePaymentStats.tarjeta} icon={<CreditCard />} color="text-blue-700" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
    return (
        <div className="p-6 rounded-3xl shadow-ambient border-ghost border flex flex-col justify-between" style={{ background: 'var(--color-surface-container-lowest)' }}>
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl" style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>{icon}</div>
                {trend && <span className="text-sm font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>{trend}</span>}
            </div>
            <div>
                <p className="text-sm font-bold opacity-60 mb-2">{title}</p>
                <h4 className="font-display text-3xl font-bold">{value}</h4>
            </div>
        </div>
    );
}

function PaymentRow({ method, total, icon, color }: { method: string, total: number, icon: React.ReactNode, color: string }) {
    return (
        <div className="flex items-center gap-5 p-2">
            <div className={`p-4 rounded-2xl shadow-sm ${color}`} style={{ background: 'var(--color-surface-container-low)' }}>{icon}</div>
            <div className="flex-1">
                <h5 className="font-bold text-lg">{method}</h5>
            </div>
            <span className="font-bold text-xl">Bs. {total.toFixed(2)}</span>
        </div>
    );
}
