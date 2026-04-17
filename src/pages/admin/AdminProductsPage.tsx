import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api'
import type { Product } from '../../types'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  const load = () => {
    adminApi.products.list().then(setProducts).catch(() => navigate('/admin')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function toggleStatus(p: Product) {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Товары</h1>
          <nav className="flex gap-4 text-sm">
            <button onClick={() => navigate('/admin/orders')} className="text-gray-500 hover:text-gray-800">Заказы</button>
            <span className="font-semibold text-blue-500 border-b-2 border-blue-500 pb-1">Товары</span>
          </nav>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/products/new')}
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium">+ Добавить товар</button>
          <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin') }}
            className="text-sm text-gray-400 hover:text-gray-600">Выйти</button>
        </div>
      </header>

      <div className="px-6 py-5">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Загрузка...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {['Фото', 'Название', 'Цена', 'Статус', 'Варианты', 'Действия'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Товаров нет</td></tr>
                )}
                {products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {p.images[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                        : <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xl">🖼</div>
                      }
                    </td>
                    <td className="px-4 py-3 font-medium max-w-xs">
                      <p>{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-semibold">{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(p)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                        {p.status === 'available' ? 'В наличии' : 'Нет в наличии'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.variants && p.variants.length > 0
                        ? p.variants.map(v => v.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium">Изменить</button>
                        <button onClick={() => del(p)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium">Удалить</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
