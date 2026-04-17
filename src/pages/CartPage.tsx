import { useNavigate } from 'react-router-dom'
import { useCartStore, calcItemPrice } from '../store/cart'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, getTotal, clear } = useCartStore()
  const total = getTotal()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <header className="sticky top-0 z-10 flex items-center px-4 py-4 border-b border-zinc-800"
        style={{ background: '#0a0a0a' }}>
        <button onClick={() => navigate('/')} className="mr-4 text-zinc-400 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white flex-1">Корзина</h1>
        {items.length > 0 && (
          <button onClick={() => clear()} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-5 pb-20">
          <span className="text-6xl opacity-10">◻</span>
          <p className="text-xs uppercase tracking-widest text-zinc-600">Корзина пуста</p>
          <button onClick={() => navigate('/')}
            className="px-8 py-3 text-xs font-black uppercase tracking-widest"
            style={{ background: '#e354ff', color: '#fff' }}>
            В каталог
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pb-40">
            {items.map((item, idx) => {
              const itemPrice = calcItemPrice(item)
              const varText = Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' · ')
              return (
                <div key={idx} className="flex gap-3 px-4 py-4 border-b border-zinc-900">
                  <div className="w-20 h-20 flex-shrink-0 bg-zinc-900 overflow-hidden">
                    {item.product.images[0]
                      ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center opacity-20 text-2xl">◻</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-white leading-tight">{item.product.name}</p>
                      {varText && <p className="text-xs mt-0.5 text-zinc-600 uppercase tracking-wider">{varText}</p>}
                    </div>
                    <p className="text-sm font-black" style={{ color: '#e354ff' }}>
                      {(itemPrice * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between py-0.5">
                    <button onClick={() => removeItem(idx)} className="text-zinc-700 hover:text-zinc-400 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center font-black border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors">−</button>
                      <span className="text-sm font-black text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center font-black border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors">+</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 border-t border-zinc-800"
            style={{ background: '#0a0a0a' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase tracking-widest text-zinc-500">Итого</span>
              <span className="text-2xl font-black text-white">{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button onClick={() => navigate('/checkout')}
              className="w-full py-4 text-sm font-black uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: '#e354ff', color: '#fff' }}>
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  )
}
