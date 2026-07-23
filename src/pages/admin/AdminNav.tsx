import { useNavigate } from 'react-router-dom'

export const ACCENT = '#e354ff'

export default function AdminNav({ active, children }: { active: 'orders' | 'products'; children?: React.ReactNode }) {
  const navigate = useNavigate()

  function tabClass(tab: 'orders' | 'products') {
    return active === tab
      ? 'text-white border-b-2 pb-1'
      : 'text-zinc-500 hover:text-zinc-300 pb-1 border-b-2 border-transparent transition-colors'
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800" style={{ background: '#0a0a0a' }}>
      <div className="flex items-center gap-8">
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">Admin</h1>
        <nav className="flex gap-6 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => navigate('/admin/orders')} className={tabClass('orders')}
            style={active === 'orders' ? { borderColor: ACCENT } : undefined}>Заказы</button>
          <button onClick={() => navigate('/admin/products')} className={tabClass('products')}
            style={active === 'products' ? { borderColor: ACCENT } : undefined}>Товары</button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {children}
        <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin') }}
          className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
          Выйти
        </button>
      </div>
    </header>
  )
}
