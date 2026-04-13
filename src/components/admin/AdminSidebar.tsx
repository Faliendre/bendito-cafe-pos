import Link from 'next/link';
import { BarChart, Package } from 'lucide-react';

export function AdminSidebar({ active }: { active: 'dashboard' | 'products' }) {
    return (
        <aside className="w-full md:w-64 border-r border-ghost flex flex-col pt-8 pb-8 px-6" style={{ background: 'var(--color-surface-container-low)' }}>
            <h1 className="font-display font-bold text-3xl mb-12" style={{ color: 'var(--color-primary)' }}>Bendito Admin</h1>
            <nav className="space-y-4 flex-1">
                <Link href="/admin" className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${active === 'dashboard' ? 'shadow-ambient bg-black/5 opacity-100' : 'hover:bg-black/5 opacity-80'}`} style={active === 'dashboard' ? { background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' } : { color: 'var(--color-on-surface-variant)' }}>
                    <BarChart size={24} /> <span className="font-bold text-lg">Dashboard</span>
                </Link>
                <Link href="/admin/products" className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${active === 'products' ? 'shadow-ambient bg-black/5 opacity-100' : 'hover:bg-black/5 opacity-80'}`} style={active === 'products' ? { background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' } : { color: 'var(--color-on-surface-variant)' }}>
                    <Package size={24} /> <span className="font-bold text-lg">Productos</span>
                </Link>
            </nav>
            <Link href="/" className="mt-auto flex items-center justify-center gap-2 font-bold p-4 rounded-2xl border-ghost border shadow-sm transition-transform active:scale-95 hover:bg-black/5" style={{ color: 'var(--color-primary)', background: 'var(--color-surface-container)' }}>
                Volver al POS
            </Link>
        </aside>
    );
}
