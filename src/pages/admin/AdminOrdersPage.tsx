import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api'
import AdminNav, { ACCENT } from './AdminNav'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтверждён', cancelled: 'Отменён', expired: 'Истёк'
}
const STATUS_DOT: Record<string, string> = {
  new: '#fbbf24', confirmed: '#34d399', cancelled: ACCENT, expired: '#71717a'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-300">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[status] || '#71717a' }} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

const cellStyle = { background: '#0a0a0a', color: '#fff', border: '1px solid #2a2a2a' }

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
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <AdminNav active="orders" />

      <div className="px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Поиск по номеру или имени..."
            style={cellStyle} className="outline-none px-4 py-2.5 text-sm w-72" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            style={cellStyle} className="outline-none px-4 py-2.5 text-sm">
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-24 text-zinc-600 text-xs uppercase tracking-widest">Загрузка...</div>
        ) : (
          <>
            <div className="border border-zinc-800 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Номер', 'Покупатель', 'Телефон', 'Сумма', 'Дата', 'Статус', 'Действие'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-bold uppercase tracking-widest text-xs text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.orders.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-16 text-zinc-600 text-xs uppercase tracking-widest">Заказов нет</td></tr>
                  )}
                  {data.orders.map((order: any) => (
                    <>
                      <tr key={order.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                        <td className="px-4 py-3 font-mono font-medium" style={{ color: ACCENT }}>{order.id}</td>
                        <td className="px-4 py-3 text-white">{order.customerName}</td>
                        <td className="px-4 py-3 text-zinc-400">{order.customerPhone}</td>
                        <td className="px-4 py-3 font-black text-white">{Number(order.totalAmount).toLocaleString('ru-RU')} ₽</td>
                        <td className="px-4 py-3 text-zinc-500">{new Date(order.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <select value={order.status}
                            onChange={e => changeStatus(order.id, e.target.value)}
                            style={{ background: '#141414', color: '#fff', border: '1px solid #2a2a2a' }}
                            className="outline-none px-2 py-1.5 text-xs">
                            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                      {expanded === order.id && (
                        <tr key={`${order.id}-detail`} style={{ background: '#141414' }}>
                          <td colSpan={7} className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Состав заказа</p>
                                {order.items.map((item: any) => (
                                  <div key={item.id} className="flex justify-between text-sm py-1 text-zinc-200">
                                    <span>{item.product.name}
                                      {item.variants && Object.values(item.variants).length > 0
                                        ? ` (${Object.values(item.variants).join(', ')})` : ''} × {item.quantity}
                                    </span>
                                    <span className="font-bold">{(Number(item.price)*item.quantity).toLocaleString('ru-RU')} ₽</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-sm space-y-1.5 text-zinc-200">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Покупатель</p>
                                <p><b className="text-zinc-500 font-normal">Адрес:</b> {order.address}</p>
                                {order.telegramUsername && <p><b className="text-zinc-500 font-normal">Telegram:</b> @{order.telegramUsername}</p>}
                                {order.comment && <p><b className="text-zinc-500 font-normal">Комментарий:</b> {order.comment}</p>}
                                <p className="text-xs text-zinc-600 mt-2">
                                  Резерв до: {new Date(order.reservedUntil).toLocaleString('ru-RU')}
                                </p>
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

            {data.total > data.pageSize && (
              <div className="flex items-center justify-between mt-5 text-xs uppercase tracking-widest text-zinc-500">
                <span>Всего: {data.total}</span>
                <div className="flex gap-2 items-center">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 border border-zinc-800 disabled:opacity-30 text-zinc-300 hover:border-zinc-600 transition-colors">← Назад</button>
                  <span className="px-2">{page} / {Math.ceil(data.total / data.pageSize)}</span>
                  <button disabled={page >= Math.ceil(data.total / data.pageSize)} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 border border-zinc-800 disabled:opacity-30 text-zinc-300 hover:border-zinc-600 transition-colors">Вперёд →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
