import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCartStore } from '../store/cart'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotal, clear } = useCartStore()
  const total = getTotal()

  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverErr, setServerErr] = useState('')

  if (items.length === 0) { navigate('/'); return null }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())    e.name    = 'Обязательное поле'
    if (!form.phone.trim())   e.phone   = 'Обязательное поле'
    if (!form.address.trim()) e.address = 'Обязательное поле'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true); setServerErr('')
    try {
      const ikey = crypto.randomUUID()
      const order = await api.orders.create({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, variants: i.selectedVariants })),
        customerName: form.name, customerPhone: form.phone,
        address: form.address, comment: form.comment || undefined
      }, ikey)
      clear()
      navigate(`/success/${order.id}`)
    } catch (err: any) {
      if (err.status === 409) setServerErr('Некоторые товары недоступны. Обновите корзину.')
      else setServerErr(err.message || 'Произошла ошибка')
    } finally { setLoading(false) }
  }

  const fieldStyle = {
    background: '#141414', color: '#fff', border: '1px solid #2a2a2a',
    outline: 'none', width: '100%', padding: '12px 14px', fontSize: 14
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <header className="sticky top-0 z-10 flex items-center px-4 py-4 border-b border-zinc-800"
        style={{ background: '#0a0a0a' }}>
        <button onClick={() => navigate('/cart')} className="mr-4 text-zinc-400 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">Оформление</h1>
      </header>

      <div className="px-4 py-5 space-y-4 pb-36">
        <div className="flex justify-between items-center py-3 border-b border-zinc-900">
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            {items.reduce((n, i) => n + i.quantity, 0)} позиций
          </span>
          <span className="text-base font-black text-white">{total.toLocaleString('ru-RU')} ₽</span>
        </div>

        {[
          { key: 'name', label: 'Имя', placeholder: 'Иван Иванов', type: 'text' },
          { key: 'phone', label: 'Телефон', placeholder: '+7 999 000-00-00', type: 'tel' },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">{label} *</label>
            <input type={type} value={(form as any)[key]} placeholder={placeholder}
              onChange={e => set(key, e.target.value)} style={fieldStyle} />
            {errors[key] && <p className="text-xs mt-1" style={{ color: '#d4a843' }}>{errors[key]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Адрес доставки *</label>
          <textarea rows={3} value={form.address} placeholder="г. Москва, ул. Пушкина, д. 1, кв. 10"
            onChange={e => set('address', e.target.value)}
            style={{ ...fieldStyle, resize: 'none' }} />
          {errors.address && <p className="text-xs mt-1" style={{ color: '#d4a843' }}>{errors.address}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Комментарий</label>
          <textarea rows={2} value={form.comment} placeholder="Необязательно"
            onChange={e => set('comment', e.target.value)}
            style={{ ...fieldStyle, resize: 'none' }} />
        </div>

        {serverErr && (
          <p className="text-xs py-3 px-4 border" style={{ color: '#d4a843', borderColor: '#d4a843', background: 'rgba(212,168,67,0.05)' }}>
            {serverErr}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 border-t border-zinc-800"
        style={{ background: '#0a0a0a' }}>
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 text-sm font-black uppercase tracking-widest disabled:opacity-40 transition-all hover:opacity-90"
          style={{ background: '#d4a843', color: '#0a0a0a' }}>
          {loading ? '...' : `Оформить — ${total.toLocaleString('ru-RU')} ₽`}
        </button>
      </div>
    </div>
  )
}
