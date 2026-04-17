import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтверждён', cancelled: 'Отменён', expired: 'Истёк'
}
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', expired: 'bg-gray-100 text-gray-500'
}

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [data, setData]       = useState<any>({ orders: [], total: 0, page: 1 })
  const [status, setStatus]   = useState('')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.orders.list({ status: status || undefined, page, search: search || undefined })
      .then(setData).catch(() => navigate('/admin')).finally(() => setLoading(false))
  }, [status, page, search, navigate])

  useEffect(() => { load() }, [load])

  async function changeStatus(id: string, newStatus: string) {
    await adminApi.orders.updateStatus(id, newStatus)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Заказы</h1>
          <nav className="flex gap-4 text-sm">
            <span className="font-semibold text-blue-500 border-b-2 border-blue-500 pb-1">Заказы</span>
            <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-gray-800">Товары</button>
          </nav>
        </div>
        <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin') }}
          className="text-sm text-gray-400 hover:text-gray-600">Выйти</button>
      </header>

      <div className="px-6 py-5">
        {/* Фильтры */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Поиск по номеру или имени..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none w-64" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Загрузка...</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    {['Номер', 'Покупатель', 'Телефон', 'Сумма', 'Дата', 'Статус', 'Действие'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.orders.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">Заказов нет</td></tr>
                  )}
                  {data.orders.map((order: any) => (
                    <>
                      <tr key={order.id} className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                        <td className="px-4 py-3 font-mono font-medium text-blue-600">{order.id}</td>
                        <td className="px-4 py-3">{order.customerName}</td>
                        <td className="px-4 py-3 text-gray-500">{order.customerPhone}</td>
                        <td className="px-4 py-3 font-semibold">{Number(order.totalAmount).toLocaleString('ru-RU')} ₽</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <select value={order.status}
                            onChange={e => changeStatus(order.id, e.target.value)}
                            className="border border-gray-200 rounded px-2 py-1 text-xs outline-none">
                            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                      {expanded === order.id && (
                        <tr key={`${order.id}-detail`} className="bg-blue-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Состав заказа</p>
                                {order.items.map((item: any) => (
                                  <div key={item.id} className="flex justify-between text-sm py-1">
                                    <span>{item.product.name}
                                      {item.variants && Object.values(item.variants).length > 0
                                        ? ` (${Object.values(item.variants).join(', ')})` : ''} × {item.quantity}
                                    </span>
                                    <span className="font-medium">{(Number(item.price)*item.quantity).toLocaleString('ru-RU')} ₽</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-sm space-y-1">
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Покупатель</p>
                                <p><b>Адрес:</b> {order.address}</p>
                                {order.telegramUsername && <p><b>Telegram:</b> @{order.telegramUsername}</p>}
                                {order.comment && <p><b>Комментарий:</b> {order.comment}</p>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {data.total > data.pageSize && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>Всего: {data.total}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded border disabled:opacity-40">← Назад</button>
                  <span className="px-3 py-1.5">{page} / {Math.ceil(data.total / data.pageSize)}</span>
                  <button disabled={page >= Math.ceil(data.total / data.pageSize)} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded border disabled:opacity-40">Вперёд →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
