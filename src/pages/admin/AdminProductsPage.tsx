import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api'
import type { Product } from '../../types'
import AdminNav, { ACCENT } from './AdminNav'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    adminApi.products.list().then(setProducts).catch(() => navigate('/admin')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function toggleStatus(p: any) {
    const newStatus = p.status === 'available' ? 'unavailable' : 'available'
    await adminApi.products.update(p.id, { ...p, status: newStatus })
    load()
  }

  async function del(p: Product) {
    if (!confirm(`Удалить "${p.name}"?`)) return
    await adminApi.products.delete(p.id)
    load()
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <AdminNav active="products">
        <button onClick={() => navigate('/admin/products/new')}
          className="text-xs font-black uppercase tracking-widest px-4 py-2 transition-opacity hover:opacity-90"
          style={{ background: ACCENT, color: '#fff' }}>+ Добавить</button>
      </AdminNav>

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-24 text-zinc-600 text-xs uppercase tracking-widest">Загрузка...</div>
        ) : (
          <div className="border border-zinc-800 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Фото', 'Название', 'Категория', 'Цена', 'Остаток', 'Статус', 'Действия'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-bold uppercase tracking-widest text-xs text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-zinc-600 text-xs uppercase tracking-widest">Товаров нет</td></tr>
                )}
                {products.map((p: any) => {
                  const lowStock = p.stock != null && p.stock <= 5 && p.stock > 0
                  const noStock = p.stock === 0
                  return (
                    <tr key={p.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3">
                        {p.images[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover border border-zinc-800" />
                          : <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center text-xl text-zinc-700">◻</div>
                        }
                      </td>
                      <td className="px-4 py-3 font-medium max-w-xs text-white">
                        <p>{p.name}</p>
                        {p.description && <p className="text-xs text-zinc-500 truncate mt-0.5 font-normal">{p.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '—'}
                      </td>
                      <td className="px-4 py-3 font-black text-white">{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3">
                        {p.stock == null ? (
                          <span className="text-zinc-600">∞</span>
                        ) : noStock ? (
                          <span style={{ color: ACCENT }} className="font-bold">0</span>
                        ) : lowStock ? (
                          <span className="text-amber-400 font-bold">{p.stock}</span>
                        ) : (
                          <span className="text-zinc-300">{p.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStatus(p)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full"
                            style={{ background: p.status === 'available' ? '#34d399' : '#71717a' }} />
                          {p.status === 'available' ? 'В наличии' : 'Скрыт'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                            className="text-xs font-bold uppercase tracking-wide text-zinc-300 hover:text-white transition-colors">Изменить</button>
                          <button onClick={() => del(p)}
                            className="text-xs font-bold uppercase tracking-wide text-zinc-600 hover:text-fuchsia-400 transition-colors">Удалить</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
