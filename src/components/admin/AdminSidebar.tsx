import Link from 'next/link';
import { BarChart, Package } from 'lucide-react';

export function AdminSidebar({ active }: { active: 'dashboard' | 'products' }) {
    return (
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-ghost flex flex-col md:pt-8 md:pb-8 p-4 md:px-6 flex-shrink-0" style={{ background: 'var(--color-surface-container-low)' }}>
            <h1 className="hidden md:block font-display font-bold text-3xl mb-12" style={{ color: 'var(--color-primary)' }}>Bendito Admin</h1>
            <nav className="flex flex-row md:flex-col gap-2 md:space-y-4 mb-4 md:mb-0 flex-1 md:flex-none overflow-x-auto scrollbar-hide">
                <Link href="/admin" className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-4 p-3 md:p-4 rounded-2xl transition-colors ${active === 'dashboard' ? 'shadow-ambient bg-black/5 opacity-100' : 'hover:bg-black/5 opacity-80'}`} style={active === 'dashboard' ? { background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' } : { color: 'var(--color-on-surface-variant)' }}>
                    <BarChart size={20} className="md:w-6 md:h-6" /> <span className="font-bold text-sm md:text-lg">Dashboard</span>
                </Link>
                <Link href="/admin/products" className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-4 p-3 md:p-4 rounded-2xl transition-colors ${active === 'products' ? 'shadow-ambient bg-black/5 opacity-100' : 'hover:bg-black/5 opacity-80'}`} style={active === 'products' ? { background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' } : { color: 'var(--color-on-surface-variant)' }}>
                    <Package size={20} className="md:w-6 md:h-6" /> <span className="font-bold text-sm md:text-lg">Productos</span>
                </Link>
            </nav>
            <Link href="/" className="md:mt-auto flex items-center justify-center gap-2 font-bold p-3 md:p-4 rounded-2xl border-ghost border shadow-sm transition-transform active:scale-95 hover:bg-black/5 text-sm md:text-base" style={{ color: 'var(--color-primary)', background: 'var(--color-surface-container)' }}>
                Volver al POS
            </Link>
        </aside>
    );
}
