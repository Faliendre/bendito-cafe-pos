"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { usePos } from '@/lib/pos-context';
import { 
    Plus, Trash2, Download, TrendingUp, TrendingDown, DollarSign, 
    Calendar, Filter, Database, AlertTriangle, FileSpreadsheet, X, Check,
    Receipt, Tag, Lightbulb, RefreshCw, ArrowUpRight
} from 'lucide-react';
import localforage from 'localforage';
import { Expense, Order } from '@/lib/types';

const localExpensesStore = localforage.createInstance({
    name: 'BenditoPOS',
    storeName: 'expenses_data',
});

const EXPENSE_CATEGORIES = ['Alquiler', 'Servicios', 'Insumos', 'Sueldos', 'Mantenimiento', 'Otros'];

export default function AdminExpenses() {
    const { showConfirm, showMessage } = usePos();
    
    // Core data states
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    
    // DB status state (in case 'expenses' table doesn't exist yet in Supabase)
    const [dbFallback, setDbFallback] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter states
    const [periodFilter, setPeriodFilter] = useState<'hoy' | 'dia' | 'mes' | 'año' | 'rango'>('mes');
    const [customDate, setCustomDate] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });
    const [customMonth, setCustomMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
    const [customYear, setCustomYear] = useState<string>(() => String(new Date().getFullYear()));
    const [customStartDate, setCustomStartDate] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [customEndDate, setCustomEndDate] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });

    // Form Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [formDescription, setFormDescription] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formCategory, setFormCategory] = useState('Insumos');
    const [formDate, setFormDate] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });

    const yearsList = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));
    }, []);

    const monthsList = [
        { value: '01', name: 'Enero' },
        { value: '02', name: 'Febrero' },
        { value: '03', name: 'Marzo' },
        { value: '04', name: 'Abril' },
        { value: '05', name: 'Mayo' },
        { value: '06', name: 'Junio' },
        { value: '07', name: 'Julio' },
        { value: '08', name: 'Agosto' },
        { value: '09', name: 'Septiembre' },
        { value: '10', name: 'Octubre' },
        { value: '11', name: 'Noviembre' },
        { value: '12', name: 'Diciembre' }
    ];

    // Initialize: load orders and expenses
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        setIsRefreshing(true);
        await Promise.all([loadOrders(), loadExpenses()]);
        setLoading(false);
        setIsRefreshing(false);
    }

    async function loadOrders() {
        try {
            // Load all completed (paid) orders to compute earnings
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('payment_status', 'pagado')
                .order('created_at', { ascending: false });
            
            if (data && !error) {
                setOrders(data as Order[]);
            }
        } catch (e) {
            console.error("Error loading orders", e);
        }
    }

    async function loadExpenses() {
        try {
            // Try to load from Supabase
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                // Table doesn't exist (Error code 42P01 in PG) or offline
                if (error.code === '42P01') {
                    console.warn("Table 'expenses' not found in Supabase. Falling back to LocalForage.");
                    setDbFallback(true);
                    const localData = await localExpensesStore.getItem<Expense[]>('expenses') || [];
                    setExpenses(localData);
                } else {
                    throw error;
                }
            } else if (data) {
                setExpenses(data as Expense[]);
                setDbFallback(false);
                // Sync to local cache
                await localExpensesStore.setItem('expenses', data);
            }
        } catch (e) {
            console.error("Error loading expenses from Supabase. Using local storage.", e);
            setDbFallback(true);
            const localData = await localExpensesStore.getItem<Expense[]>('expenses') || [];
            setExpenses(localData);
        }
    }

    // Helper to check if a record timestamp falls in the selected period
    const isInPeriod = (createdAt?: string) => {
        if (!createdAt) return false;
        
        // Parse date in browser's local timezone to match user expectation
        const dateObj = new Date(createdAt);
        if (isNaN(dateObj.getTime())) return false;

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (periodFilter === 'hoy') {
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            return dateStr === todayStr;
        }
        if (periodFilter === 'dia') {
            return dateStr === customDate;
        }
        if (periodFilter === 'mes') {
            return String(year) === customYear && month === customMonth;
        }
        if (periodFilter === 'año') {
            return String(year) === customYear;
        }
        if (periodFilter === 'rango') {
            return dateStr >= customStartDate && dateStr <= customEndDate;
        }
        return true;
    };

    // Computations based on filtered orders & expenses
    const filteredOrders = useMemo(() => {
        return orders.filter(o => isInPeriod(o.created_at));
    }, [orders, periodFilter, customDate, customMonth, customYear, customStartDate, customEndDate]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => isInPeriod(e.created_at));
    }, [expenses, periodFilter, customDate, customMonth, customYear, customStartDate, customEndDate]);

    // Financial balance metrics
    const totalEarnings = useMemo(() => {
        return filteredOrders.reduce((sum, o) => sum + Number(o.total), 0);
    }, [filteredOrders]);

    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    }, [filteredExpenses]);

    const netProfit = useMemo(() => {
        return totalEarnings - totalExpenses;
    }, [totalEarnings, totalExpenses]);

    // Group expenses by category
    const categoryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        EXPENSE_CATEGORIES.forEach(cat => {
            breakdown[cat] = 0;
        });

        filteredExpenses.forEach(e => {
            const cat = EXPENSE_CATEGORIES.includes(e.category) ? e.category : 'Otros';
            breakdown[cat] = (breakdown[cat] || 0) + Number(e.amount);
        });

        return Object.entries(breakdown)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [filteredExpenses, totalExpenses]);

    // Add new expense handler
    async function handleAddExpense(e: React.FormEvent) {
        e.preventDefault();
        const amountNum = parseFloat(formAmount);
        if (!formDescription.trim() || isNaN(amountNum) || amountNum <= 0) {
            showMessage("Error", "Por favor ingresa una descripción y un monto válido.", "error");
            return;
        }

        // Set date to midday (12:00) of the selected local date to avoid timezone offset conversion bugs
        const dateWithTime = new Date(`${formDate}T12:00:00`);
        const payload = {
            description: formDescription.trim(),
            amount: amountNum,
            category: formCategory,
            created_at: dateWithTime.toISOString()
        };

        if (!dbFallback) {
            try {
                const { data, error } = await supabase
                    .from('expenses')
                    .insert(payload)
                    .select()
                    .single();
                
                if (error) throw error;

                showMessage("Gasto Registrado", "El gasto se ha guardado correctamente en la base de datos.", "success");
                setShowAddModal(false);
                resetForm();
                loadExpenses();
                return;
            } catch (error: any) {
                console.error("Error saving to Supabase. Saving locally as fallback.", error?.message || error, error);
            }
        }

        // Local Storage fallback
        try {
            const localId = `local_${Math.random().toString(36).substring(2, 15)}`;
            const localExpense: Expense = {
                id: localId,
                ...payload
            };
            const currentLocal = await localExpensesStore.getItem<Expense[]>('expenses') || [];
            const updated = [localExpense, ...currentLocal];
            await localExpensesStore.setItem('expenses', updated);
            
            setExpenses(updated);
            showMessage("Gasto Guardado (Local)", "La tabla 'expenses' no está lista en Supabase. Se guardó localmente.", "success");
            setShowAddModal(false);
            resetForm();
        } catch (localError) {
            console.error("Local save failed", localError);
            showMessage("Error", "No se pudo guardar el gasto.", "error");
        }
    }

    // Delete expense handler
    async function handleDeleteExpense(id: string) {
        const confirmed = await showConfirm(
            "Eliminar Gasto",
            "¿Estás seguro de que deseas eliminar este registro de gasto? Esta acción no se puede deshacer."
        );
        if (!confirmed) return;

        // Check if it's a Supabase UUID or local ID
        const isLocal = id.startsWith('local_');

        if (!dbFallback && !isLocal) {
            try {
                const { error } = await supabase.from('expenses').delete().eq('id', id);
                if (error) throw error;

                showMessage("Eliminado", "El gasto se eliminó correctamente de la base de datos.", "success");
                loadExpenses();
                return;
            } catch (error) {
                console.error("Error deleting from Supabase", error);
            }
        }

        // Local deletion
        try {
            const currentLocal = await localExpensesStore.getItem<Expense[]>('expenses') || [];
            const updated = currentLocal.filter(e => e.id !== id);
            await localExpensesStore.setItem('expenses', updated);
            
            setExpenses(updated);
            showMessage("Eliminado (Local)", "El gasto local se eliminó correctamente.", "success");
        } catch (e) {
            console.error("Local delete failed", e);
            showMessage("Error", "No se pudo eliminar el gasto.", "error");
        }
    }

    function resetForm() {
        setFormDescription('');
        setFormAmount('');
        setFormCategory('Insumos');
        const today = new Date();
        setFormDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    }

    // Export to Excel (CSV format with BOM and sep directive for instant compatibility)
    function handleExportExcel() {
        if (filteredOrders.length === 0 && filteredExpenses.length === 0) {
            showMessage("Sin Datos", "No hay ingresos ni egresos en este período para exportar.", "error");
            return;
        }

        // Formulate income rows from orders
        const incomeRows = filteredOrders.map(o => {
            const total = Number(o.total);
            const received = o.payment_method === 'efectivo' ? (Number(o.cash_received) || total) : total;
            const change = o.payment_method === 'efectivo' ? (Number(o.change_returned) || 0) : 0;
            return {
                rawDate: new Date(o.created_at!),
                tipo: 'Ingreso',
                categoria: 'Ventas',
                descripcion: `Venta #${o.id?.substring(0, 8)} - ${o.customer_name || 'Cliente general'} (${o.payment_method})`,
                pagoCliente: received,
                cambioEgreso: change,
                totalNeto: total
            };
        });

        // Formulate expense rows
        const expenseRows = filteredExpenses.map(e => ({
            rawDate: new Date(e.created_at!),
            tipo: 'Egreso',
            categoria: e.category,
            descripcion: e.description,
            pagoCliente: 0,
            cambioEgreso: Number(e.amount),
            totalNeto: -Number(e.amount)
        }));

        // Combine and sort chronologically
        const ledger = [...incomeRows, ...expenseRows].sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

        // Construct CSV
        // Standard Excel directive to force comma delimiter
        let csv = "sep=,\n";
        csv += "Fecha,Tipo,Categoría,Descripción,Ingreso / Pago (Bs),Egreso / Vuelto (Bs),Total Neto (Bs),Balance Acumulado (Bs)\n";

        let runningBalance = 0;
        ledger.forEach(item => {
            runningBalance += item.pagoCliente - item.cambioEgreso;
            const dateStr = item.rawDate.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
            
            // Format cells with quotes to safely handle strings with commas
            const descSafe = `"${item.descripcion.replace(/"/g, '""')}"`;
            const catSafe = `"${item.categoria.replace(/"/g, '""')}"`;
            
            csv += `"${dateStr}",${item.tipo},${catSafe},${descSafe},${item.pagoCliente.toFixed(2)},${item.cambioEgreso.toFixed(2)},${item.totalNeto.toFixed(2)},${runningBalance.toFixed(2)}\n`;
        });

        // Trigger file download with UTF-8 BOM
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        let periodName = periodFilter;
        if (periodFilter === 'mes') periodName += `_${customYear}-${customMonth}`;
        else if (periodFilter === 'dia') periodName += `_${customDate}`;
        else if (periodFilter === 'año') periodName += `_${customYear}`;
        else if (periodFilter === 'rango') periodName += `_del_${customStartDate}_al_${customEndDate}`;

        link.href = url;
        link.download = `balance_benditocafe_${periodName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showMessage("Exportación Exitosa", "Se ha generado tu reporte de balance en formato CSV/Excel.", "success");
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row text-on-surface" style={{ background: 'var(--color-surface)' }}>
            <AdminSidebar active="expenses" />

            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                {/* Header */}
                <header className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>Gastos y Balance</h2>
                            <button 
                                onClick={loadData} 
                                className={`p-2 rounded-xl border border-ghost hover:bg-black/5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                                title="Actualizar datos"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                        <p className="opacity-70 mt-2 text-base md:text-lg">Controla tus gastos operativos y evalúa las ganancias de la cafetería.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <button
                            onClick={handleExportExcel}
                            className="btn-secondary rounded-2xl flex items-center justify-center gap-2 px-6 py-3 font-bold border border-ghost shadow-sm hover:opacity-90 transition-all text-sm md:text-base cursor-pointer"
                        >
                            <FileSpreadsheet size={20} /> Exportar Excel
                        </button>
                        
                        <button
                            onClick={() => { resetForm(); setShowAddModal(true); }}
                            className="btn-primary rounded-2xl flex items-center justify-center gap-2 px-6 py-3 font-bold shadow-ambient transition-transform active:scale-95 text-sm md:text-base cursor-pointer"
                        >
                            <Plus size={20} /> Registrar Gasto
                        </button>
                    </div>
                </header>

                {/* DB Fallback Banner */}
                {dbFallback && (
                    <div className="mb-8 p-6 rounded-3xl border border-amber-200/50 bg-amber-50/80 backdrop-blur text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                        <div className="flex gap-4">
                            <div className="p-3 bg-amber-100 rounded-2xl text-amber-700 flex-shrink-0">
                                <Database size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Modo Almacenamiento Local Activo</h4>
                                <p className="text-sm opacity-90 mt-1 max-w-2xl">
                                    La tabla <code className="bg-amber-100/50 px-1.5 py-0.5 rounded font-mono font-bold text-amber-800">expenses</code> no está creada en tu base de datos Supabase o estás sin conexión. 
                                    Para guardar en la nube de forma permanente, crea la tabla ejecutando el script SQL en el panel de control de Supabase. Mientras tanto, tus gastos se guardarán en este navegador.
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex-shrink-0">
                            <details className="cursor-pointer bg-white/70 hover:bg-white p-3 px-4 rounded-xl border border-amber-200 shadow-sm text-sm font-bold text-amber-900 transition-colors">
                                <summary className="list-none flex items-center justify-between gap-2">
                                    <span>Ver Código SQL</span>
                                    <Plus size={16} />
                                </summary>
                                <pre className="mt-4 p-4 rounded-xl bg-black text-amber-300 font-mono text-xs overflow-x-auto max-w-full text-left select-all">
{`CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar tiempo real
alter publication supabase_realtime add table expenses;`}
                                </pre>
                            </details>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <section className="mb-8 p-6 rounded-3xl shadow-sm border border-ghost flex flex-col lg:flex-row lg:items-center justify-between gap-6" style={{ background: 'var(--color-surface-container-lowest)' }}>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="p-3 bg-black/5 rounded-2xl text-primary flex-shrink-0 mr-2">
                            <Filter size={18} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider opacity-60 mr-4">Filtrar por:</span>
                        
                        {(['hoy', 'dia', 'mes', 'año', 'rango'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setPeriodFilter(type)}
                                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors border ${periodFilter === type ? 'shadow-sm' : 'border-transparent opacity-75 hover:bg-black/5'}`}
                                style={periodFilter === type ? { background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)', borderColor: 'var(--color-ghost)' } : {}}
                            >
                                {type === 'dia' ? 'Específico' : type === 'año' ? 'Año' : type}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Filters Inputs */}
                    <div className="flex flex-wrap items-center gap-4">
                        {periodFilter === 'dia' && (
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="opacity-50" />
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="p-2.5 rounded-xl text-sm font-bold border border-ghost focus:outline-none"
                                    style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                                />
                            </div>
                        )}

                        {periodFilter === 'mes' && (
                            <div className="flex gap-2">
                                <select
                                    value={customMonth}
                                    onChange={(e) => setCustomMonth(e.target.value)}
                                    className="p-2.5 rounded-xl text-sm font-bold border border-ghost focus:outline-none cursor-pointer"
                                    style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                                >
                                    {monthsList.map(m => (
                                        <option key={m.value} value={m.value}>{m.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={customYear}
                                    onChange={(e) => setCustomYear(e.target.value)}
                                    className="p-2.5 rounded-xl text-sm font-bold border border-ghost focus:outline-none cursor-pointer"
                                    style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                                >
                                    {yearsList.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {periodFilter === 'año' && (
                            <select
                                value={customYear}
                                onChange={(e) => setCustomYear(e.target.value)}
                                className="p-2.5 rounded-xl text-sm font-bold border border-ghost focus:outline-none cursor-pointer"
                                style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                            >
                                {yearsList.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        )}

                        {periodFilter === 'rango' && (
                            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm font-bold opacity-80">
                                <span>Desde:</span>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="p-2 rounded-xl text-xs border border-ghost focus:outline-none"
                                    style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                                />
                                <span>Hasta:</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="p-2 rounded-xl text-xs border border-ghost focus:outline-none"
                                    style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-primary)' }}
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Financial Balance Overview Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Income Card */}
                    <div className="p-6 rounded-3xl shadow-ambient border-ghost border flex flex-col justify-between" style={{ background: 'var(--color-surface-container-lowest)' }}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(22, 163, 74)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/5 opacity-60">
                                {filteredOrders.length} {filteredOrders.length === 1 ? 'venta' : 'ventas'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-2">Ingresos (Gané)</p>
                            <h4 className="font-display text-3xl font-black text-green-700">Bs. {totalEarnings.toFixed(2)}</h4>
                        </div>
                    </div>

                    {/* Spendings Card */}
                    <div className="p-6 rounded-3xl shadow-ambient border-ghost border flex flex-col justify-between" style={{ background: 'var(--color-surface-container-lowest)' }}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(220, 38, 38)' }}>
                                <TrendingDown size={24} />
                            </div>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/5 opacity-60">
                                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'gasto' : 'gastos'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-2">Egresos (Gasté)</p>
                            <h4 className="font-display text-3xl font-black text-red-600">Bs. {totalExpenses.toFixed(2)}</h4>
                        </div>
                    </div>

                    {/* Net Balance Card */}
                    <div className={`p-6 rounded-3xl shadow-ambient border-ghost border flex flex-col justify-between transition-colors duration-300 ${netProfit >= 0 ? 'bg-green-50/50' : 'bg-red-50/50'}`} style={{ borderColor: netProfit >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${netProfit >= 0 ? 'bg-green-600 text-white shadow-sm' : 'bg-red-600 text-white shadow-sm'}`}>
                                <DollarSign size={24} />
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${netProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {netProfit >= 0 ? 'Superávit / Ganancia' : 'Déficit / Pérdida'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-2">Balance Neto</p>
                            <h4 className={`font-display text-3xl font-black ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                {netProfit < 0 ? '-' : ''}Bs. {Math.abs(netProfit).toFixed(2)}
                            </h4>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left & Middle columns: Expense Ledger */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-ambient border-ghost border overflow-hidden" style={{ background: 'var(--color-surface-container-lowest)' }}>
                            <div className="p-6 border-b border-ghost flex items-center justify-between">
                                <h3 className="font-display text-xl font-bold">Listado de Egresos</h3>
                                <span className="text-xs font-medium bg-black/5 px-2.5 py-1 rounded-full opacity-70">
                                    {filteredExpenses.length} registros
                                </span>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-sm opacity-60 animate-pulse font-medium">
                                    Cargando registros...
                                </div>
                            ) : filteredExpenses.length === 0 ? (
                                <div className="p-16 text-center">
                                    <TrendingDown className="mx-auto mb-4 opacity-20" size={48} />
                                    <h4 className="font-bold text-lg opacity-60">No hay egresos registrados en este período.</h4>
                                    <p className="text-sm opacity-50 mt-1 max-w-sm mx-auto">Comienza agregando un gasto con el botón &quot;Registrar Gasto&quot; arriba a la derecha.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="border-b border-ghost text-xs md:text-sm font-bold opacity-75" style={{ background: 'var(--color-surface-container-low)' }}>
                                                <th className="p-4 font-bold opacity-75">Fecha</th>
                                                <th className="p-4 font-bold opacity-75">Categoría</th>
                                                <th className="p-4 font-bold opacity-75">Descripción</th>
                                                <th className="p-4 font-bold opacity-75 text-right">Monto</th>
                                                <th className="p-4 font-bold text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExpenses.map((expense) => {
                                                const date = expense.created_at ? new Date(expense.created_at) : new Date();
                                                const formattedDate = date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
                                                return (
                                                    <tr key={expense.id} className="border-b border-ghost/50 transition-colors hover:bg-black/[0.02]">
                                                        <td className="p-4 text-sm font-semibold opacity-85">
                                                            {formattedDate}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm"
                                                                style={{ 
                                                                    background: expense.category === 'Alquiler' ? '#feddb3' :
                                                                                expense.category === 'Servicios' ? '#cffafe' :
                                                                                expense.category === 'Insumos' ? '#fecaa5' :
                                                                                expense.category === 'Sueldos' ? '#dcfce7' :
                                                                                expense.category === 'Mantenimiento' ? '#f3e8ff' : '#f3f4f6',
                                                                    color: expense.category === 'Alquiler' ? '#795336' :
                                                                           expense.category === 'Servicios' ? '#0891b2' :
                                                                           expense.category === 'Insumos' ? '#795336' :
                                                                           expense.category === 'Sueldos' ? '#15803d' :
                                                                           expense.category === 'Mantenimiento' ? '#7e22ce' : '#374151'
                                                                }}
                                                            >
                                                                {expense.category}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm font-medium">
                                                            {expense.description}
                                                        </td>
                                                        <td className="p-4 text-sm font-bold text-red-600 text-right">
                                                            Bs. {Number(expense.amount).toFixed(2)}
                                                        </td>
                                                        <td className="p-4 flex justify-center">
                                                            <button
                                                                onClick={() => handleDeleteExpense(expense.id!)}
                                                                className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                                                                title="Eliminar Gasto"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column: Category breakdown chart & stats */}
                    <div className="space-y-6">
                        {/* Expenses by Category breakdown */}
                        <div className="bg-white p-6 rounded-3xl shadow-ambient border-ghost border" style={{ background: 'var(--color-surface-container-lowest)' }}>
                            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                                <Lightbulb size={20} className="text-amber-500" /> Distribución de Egresos
                            </h3>
                            
                            {totalExpenses === 0 ? (
                                <div className="py-8 text-center text-sm opacity-50 font-medium">
                                    Registra gastos para ver el análisis de distribución.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {categoryBreakdown.map(cat => {
                                        if (cat.amount === 0) return null;
                                        return (
                                            <div key={cat.category} className="space-y-2">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="opacity-80">{cat.category}</span>
                                                    <span>Bs. {cat.amount.toFixed(2)} ({cat.percentage.toFixed(0)}%)</span>
                                                </div>
                                                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-500" 
                                                        style={{ 
                                                            width: `${cat.percentage}%`,
                                                            background: cat.category === 'Alquiler' ? 'var(--color-primary)' :
                                                                        cat.category === 'Servicios' ? '#06b6d4' :
                                                                        cat.category === 'Insumos' ? 'var(--color-secondary-container)' :
                                                                        cat.category === 'Sueldos' ? '#22c55e' :
                                                                        cat.category === 'Mantenimiento' ? '#a855f7' : '#9ca3af'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Reference Note */}
                        <div className="bg-white p-6 rounded-3xl shadow-ambient border-ghost border flex gap-4" style={{ background: 'var(--color-surface-container-lowest)' }}>
                            <div className="p-3 bg-primary/5 rounded-2xl text-primary flex-shrink-0 self-start">
                                <Lightbulb size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Consejo de Administración</h4>
                                <p className="text-xs opacity-75 mt-1.5 leading-relaxed">
                                    Mantener los egresos por debajo del 30% de los ingresos totales es ideal para garantizar la rentabilidad operativa. 
                                    Usa la exportación periódica para conciliar con tus libros de contabilidad bancarios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Expense Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center glass-panel p-4 overflow-y-auto">
                        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-ambient relative border border-ghost" style={{ background: 'var(--color-surface-container-highest)' }}>
                            <button 
                                onClick={() => setShowAddModal(false)} 
                                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-1"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                                <TrendingDown size={24} className="text-red-500" /> Registrar Gasto
                            </h3>
                            
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider opacity-70 mb-2">Descripción del Gasto</label>
                                    <input 
                                        required 
                                        type="text"
                                        value={formDescription} 
                                        onChange={e => setFormDescription(e.target.value)} 
                                        className="w-full p-4 rounded-xl border border-ghost shadow-sm focus:outline-none text-base" 
                                        style={{ background: 'var(--color-surface-container-lowest)' }} 
                                        placeholder="Ej: Alquiler de local mayo" 
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider opacity-70 mb-2">Monto (Bs)</label>
                                        <input 
                                            required 
                                            type="number" 
                                            step="0.01" 
                                            min="0.01"
                                            value={formAmount} 
                                            onChange={e => setFormAmount(e.target.value)} 
                                            className="w-full p-4 rounded-xl border border-ghost shadow-sm focus:outline-none text-base font-bold" 
                                            style={{ background: 'var(--color-surface-container-lowest)' }} 
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider opacity-70 mb-2">Categoría</label>
                                        <select 
                                            value={formCategory} 
                                            onChange={e => setFormCategory(e.target.value)} 
                                            className="w-full p-4 rounded-xl border border-ghost shadow-sm focus:outline-none appearance-none cursor-pointer text-base font-semibold" 
                                            style={{ background: 'var(--color-surface-container-lowest)' }}
                                        >
                                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider opacity-70 mb-2">Fecha del Gasto</label>
                                    <input 
                                        required
                                        type="date" 
                                        value={formDate} 
                                        onChange={e => setFormDate(e.target.value)} 
                                        className="w-full p-4 rounded-xl border border-ghost shadow-sm focus:outline-none text-base" 
                                        style={{ background: 'var(--color-surface-container-lowest)' }} 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full mt-6 py-4 font-bold rounded-xl btn-primary text-lg cursor-pointer"
                                >
                                    Guardar Gasto
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
