import { useNavigate } from 'react-router-dom'
import { useCartStore, calcItemPrice } from '../store/cart'

export default function CartPage() {
  const navigate  = useNavigate()
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()
  const total = getTotal()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--tg-theme-bg-color,#fff)' }}>
      {/* Шапка */}
      <header className="sticky top-0 z-10 flex items-center px-4 py-3"
        style={{ background: 'var(--tg-theme-bg-color,#fff)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <button onClick={() => navigate('/')} className="mr-3 text-2xl leading-none">←</button>
        <h1 className="text-lg font-bold flex-1">Корзина</h1>
        <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color,#888)' }}>
          {items.length > 0 ? `${items.reduce((n,i)=>n+i.quantity,0)} шт.` : ''}
        </span>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 pb-20">
          <span className="text-6xl">🛒</span>
          <p className="text-lg font-semibold">Корзина пуста</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--tg-theme-button-color,#2481cc)', color: 'var(--tg-theme-button-text-color,#fff)' }}>
            Перейти в каталог
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
            {items.map((item, idx) => {
              const itemPrice = calcItemPrice(item)
              const varText = Object.entries(item.selectedVariants).map(([k,v])=>`${k}: ${v}`).join(' · ')
              return (
                <div key={idx} className="flex gap-3 rounded-2xl p-3"
                  style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)' }}>
                  {/* Картинка */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                    {item.product.images[0]
                      ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🖼</div>
                    }
                  </div>
                  {/* Инфо */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">{item.product.name}</p>
                    {varText && <p className="text-xs mt-0.5" style={{ color: 'var(--tg-theme-hint-color,#888)' }}>{varText}</p>}
                    <p className="text-sm font-bold mt-1">{(itemPrice * item.quantity).toLocaleString('ru-RU')} ₽</p>
                  </div>
                  {/* Управление */}
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(idx)} className="text-lg leading-none"
                      style={{ color: 'var(--tg-theme-hint-color,#888)' }}>✕</button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold shadow-sm">−</button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold shadow-sm">+</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Фиксированный футер */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
            style={{ background: 'var(--tg-theme-bg-color,#fff)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color,#888)' }}>Итого</span>
              <span className="text-xl font-bold">{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-xl text-base font-semibold"
              style={{ background: 'var(--tg-theme-button-color,#2481cc)', color: 'var(--tg-theme-button-text-color,#fff)' }}>
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  )
}
