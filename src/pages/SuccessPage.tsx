import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import type { Order } from '../types'

const SELLER_USERNAME = import.meta.env.VITE_SELLER_USERNAME || ''

export default function SuccessPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (id) api.orders.get(id).then(setOrder).catch(() => {})
  }, [id])

  function goToSeller() {
    const msg = encodeURIComponent(
      `Здравствуйте! Я оформил(а) заказ №${id} на сумму ${Number(order?.totalAmount || 0).toLocaleString('ru-RU')} ₽. Готов(а) подтвердить и оплатить.`
    )
    const url = `https://t.me/${SELLER_USERNAME}?text=${msg}`
    const tg = (window as any).Telegram?.WebApp
    if (tg?.openTelegramLink) tg.openTelegramLink(url)
    else window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
      style={{ background: '#0a0a0a' }}>
      <div className="w-16 h-16 flex items-center justify-center border-2" style={{ borderColor: '#e354ff' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e354ff" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <div>
        <h1 className="text-xl font-black uppercase tracking-widest text-white mb-1">Заказ принят</h1>
        {id && <p className="text-xs text-zinc-600 uppercase tracking-wider font-mono">#{id}</p>}
      </div>

      {order && (
        <div className="w-full border border-zinc-800 p-4 text-left space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-xs gap-3">
              <span className="text-zinc-400 flex-1">
                {item.product.name}
                {item.variants && Object.values(item.variants).length > 0
                  ? ` / ${Object.values(item.variants).join(', ')}` : ''}
                {' '}× {item.quantity}
              </span>
              <span className="font-black text-white whitespace-nowrap">
                {(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-zinc-800 flex justify-between">
            <span className="text-xs uppercase tracking-widest text-zinc-500">Итого</span>
            <span className="font-black text-white">{Number(order.totalAmount).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-600 uppercase tracking-wider leading-relaxed">
        Свяжитесь с продавцом для подтверждения и оплаты
      </p>

      {SELLER_USERNAME && (
        <button onClick={goToSeller}
          className="w-full py-4 text-sm font-black uppercase tracking-widest transition-all hover:opacity-90"
          style={{ background: '#e354ff', color: '#fff' }}>
          Написать продавцу
        </button>
      )}
    </div>
  )
}
