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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5"
      style={{ background: 'var(--tg-theme-bg-color,#fff)' }}>
      {/* Иконка */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{ background: 'var(--tg-theme-button-color,#2481cc)' }}>✓</div>

      <div>
        <h1 className="text-xl font-bold mb-1">Заказ оформлен!</h1>
        {id && <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color,#888)' }}>#{id}</p>}
      </div>

      {order && (
        <div className="w-full rounded-2xl p-4 text-left space-y-2"
          style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)' }}>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="flex-1 mr-2">
                {item.product.name}
                {item.variants && Object.values(item.variants).length > 0
                  ? ` (${Object.values(item.variants).join(', ')})`
                  : ''}
                {' '}× {item.quantity}
              </span>
              <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
          <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
            <span>Итого</span>
            <span>{Number(order.totalAmount).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      )}

      <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color,#888)' }}>
        Для подтверждения и оплаты свяжитесь с продавцом
      </p>

      {SELLER_USERNAME && (
        <button onClick={goToSeller}
          className="w-full py-3.5 rounded-xl text-base font-semibold"
          style={{ background: 'var(--tg-theme-button-color,#2481cc)', color: 'var(--tg-theme-button-text-color,#fff)' }}>
          Перейти в чат с продавцом
        </button>
      )}
    </div>
  )
}
