import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCartStore } from '../store/cart'

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & { as?: 'input' | 'textarea' }) {
  const { as: Tag = 'input', label: _, ...rest } = { as: 'input' as const, label, ...props } as any
  const common = "w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-colors"
  const style = { background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)', color: 'var(--tg-theme-text-color,#000)' }
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {props.as === 'textarea'
        ? <textarea {...rest} style={{ ...style, resize: 'none' }} className={common} />
        : <input {...rest} style={style} className={common} />
      }
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotal, clear } = useCartStore()
  const total = getTotal()

  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(false)
  const [serverErr, setServerErr] = useState('')

  if (items.length === 0) {
    navigate('/')
    return null
  }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())    e.name    = 'Введите имя'
    if (!form.phone.trim())   e.phone   = 'Введите телефон'
    if (!form.address.trim()) e.address = 'Введите адрес'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setLoading(true)
    setServerErr('')
    try {
      const ikey = crypto.randomUUID()
      const body = {
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, variants: i.selectedVariants })),
        customerName:  form.name,
        customerPhone: form.phone,
        address:       form.address,
        comment:       form.comment || undefined
      }
      const order = await api.orders.create(body, ikey)
      clear()
      navigate(`/success/${order.id}`)
    } catch (err: any) {
      if (err.status === 409) {
        setServerErr('Некоторые товары уже недоступны. Вернитесь в корзину и обновите её.')
      } else {
        setServerErr(err.message || 'Произошла ошибка. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--tg-theme-bg-color,#fff)' }}>
      {/* Шапка */}
      <header className="sticky top-0 z-10 flex items-center px-4 py-3"
        style={{ background: 'var(--tg-theme-bg-color,#fff)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <button onClick={() => navigate('/cart')} className="mr-3 text-2xl leading-none">←</button>
        <h1 className="text-lg font-bold">Оформление заказа</h1>
      </header>

      <div className="px-4 py-5 space-y-4 pb-32">
        {/* Сводка */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--tg-theme-hint-color,#888)' }}>Товаров: {items.reduce((n,i)=>n+i.quantity,0)} шт.</span>
            <span className="font-bold">{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        {/* Форма */}
        <Field label="Имя *" placeholder="Иван Иванов" value={form.name}
          onChange={e => set('name', (e.target as HTMLInputElement).value)} />
        {errors.name && <p className="text-xs text-red-500 -mt-3">{errors.name}</p>}

        <Field label="Телефон *" placeholder="+7 999 000-00-00" type="tel" value={form.phone}
          onChange={e => set('phone', (e.target as HTMLInputElement).value)} />
        {errors.phone && <p className="text-xs text-red-500 -mt-3">{errors.phone}</p>}

        <div>
          <label className="block text-sm font-medium mb-1.5">Адрес доставки *</label>
          <textarea rows={3} placeholder="г. Москва, ул. Пушкина, д. 1, кв. 10" value={form.address}
            onChange={e => set('address', e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)', resize: 'none' }} />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Комментарий</label>
          <textarea rows={2} placeholder="Комментарий к заказу (необязательно)" value={form.comment}
            onChange={e => set('comment', e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)', resize: 'none' }} />
        </div>

        {serverErr && (
          <div className="rounded-xl p-3 bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{serverErr}</p>
          </div>
        )}
      </div>

      {/* Кнопка */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: 'var(--tg-theme-bg-color,#fff)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-3.5 rounded-xl text-base font-semibold disabled:opacity-60"
          style={{ background: 'var(--tg-theme-button-color,#2481cc)', color: 'var(--tg-theme-button-text-color,#fff)' }}>
          {loading ? 'Оформляем...' : `Оформить заказ — ${total.toLocaleString('ru-RU')} ₽`}
        </button>
      </div>
    </div>
  )
}
