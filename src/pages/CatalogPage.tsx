import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCartStore } from '../store/cart'
import type { Product, ProductVariant } from '../types'

const ACCENT = '#e354ff'

const CATEGORIES = [
  { id: '', label: 'Все' },
  { id: 'кассеты', label: 'Кассеты' },
  { id: 'винил', label: 'Винил' },
  { id: 'футболки', label: 'Футболки' },
  { id: 'худи', label: 'Худи' },
  { id: 'аксессуары', label: 'Аксессуары' },
  { id: 'другое', label: 'Другое' },
]

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [variants, setVariants] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    product.variants?.forEach(v => { if (v.values[0]) init[v.name] = v.values[0].label })
    return init
  })

  const basePrice = Number(product.price)
  const extraPrice = product.variants
    ? product.variants.reduce((sum, v) => {
        const val = v.values.find(x => x.label === variants[v.name])
        return sum + (val?.priceDiff ?? 0)
      }, 0)
    : 0
  const totalPrice = (basePrice + extraPrice) * qty

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="flex items-center px-4 py-4 border-b border-zinc-800">
        <button onClick={onClose} className="mr-4 text-zinc-400 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest text-white truncate flex-1">{product.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {product.images.length > 0 && (
          <div className="relative bg-zinc-900" style={{ paddingTop: '100%' }}>
            <img src={product.images[imgIdx]} alt={product.name}
              className="absolute inset-0 w-full h-full object-cover" />
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i === imgIdx ? ACCENT : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-black uppercase tracking-wide text-white leading-tight">{product.name}</h1>
            <span className="text-xl font-black whitespace-nowrap" style={{ color: ACCENT }}>
              {(basePrice + extraPrice).toLocaleString('ru-RU')} ₽
            </span>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-zinc-400">{product.description}</p>
          )}

          {product.variants?.map((variant: ProductVariant) => (
            <div key={variant.name}>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">{variant.name}</div>
              <div className="flex flex-wrap gap-2">
                {variant.values.map(v => {
                  const isActive = variants[variant.name] === v.label
                  return (
                    <button key={v.label}
                      onClick={() => setVariants(prev => ({ ...prev, [variant.name]: v.label }))}
                      className="px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition-all"
                      style={isActive
                        ? { background: ACCENT, color: '#fff', border: `1px solid ${ACCENT}` }
                        : { background: 'transparent', color: '#888', border: '1px solid #333' }}>
                      {v.label}{v.priceDiff !== 0 && ` +${v.priceDiff}₽`}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-5">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Кол-во</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center font-black text-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors">−</button>
              <span className="text-base font-black text-white w-5 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(99, q + 1))}
                className="w-8 h-8 flex items-center justify-center font-black text-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-4 border-t border-zinc-800">
        <button onClick={() => { useCartStore.getState().addItem(product, qty, variants); onClose() }}
          className="w-full py-4 text-sm font-black uppercase tracking-widest transition-all hover:opacity-90"
          style={{ background: ACCENT, color: '#fff' }}>
          В корзину — {totalPrice.toLocaleString('ru-RU')} ₽
        </button>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const [category, setCategory] = useState('')
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))

  useEffect(() => {
    api.products.list().then(setProducts).finally(() => setLoading(false))
  }, [])

  const filtered = category
    ? products.filter(p => (p as any).category === category)
    : products

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0a0a0a' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <header className="sticky top-0 z-10 border-b border-zinc-800" style={{ background: '#0a0a0a' }}>
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">Catalogue</h1>
          <button onClick={() => navigate('/cart')} className="relative p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="text-zinc-400 hover:text-white transition-colors">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs font-black rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: ACCENT, color: '#fff', fontSize: 10 }}>{cartCount}</span>
            )}
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat.id
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all"
                style={isActive
                  ? { background: ACCENT, color: '#fff', border: `1px solid ${ACCENT}` }
                  : { background: 'transparent', color: '#666', border: '1px solid #2a2a2a' }}>
                {cat.label}
              </button>
            )
          })}
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <span className="text-5xl opacity-10">◻</span>
          <p className="text-xs uppercase tracking-widest text-zinc-600">
            {category ? 'В этой категории пусто' : 'Товары пока не добавлены'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px" style={{ background: '#1a1a1a' }}>
          {filtered.map(product => (
            <button key={product.id}
              onClick={() => product.status === 'available' && setSelected(product)}
              className="relative flex flex-col text-left transition-opacity"
              style={{ background: '#0a0a0a', opacity: product.status === 'unavailable' ? 0.5 : 1 }}>
              <div className="relative w-full bg-zinc-900" style={{ paddingTop: '100%' }}>
                {product.images[0]
                  ? <img src={product.images[0]} alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl opacity-10">◻</span>
                    </div>
                }
                {product.status === 'unavailable' && (
                  <div className="absolute inset-0 flex items-end p-2" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <span className="text-xs font-black uppercase tracking-widest px-2 py-1"
                      style={{ background: '#333', color: '#888' }}>Нет в наличии</span>
                  </div>
                )}
              </div>
              <div className="px-3 py-3 flex flex-col gap-1" style={{ minHeight: 72 }}>
                <p className="text-xs font-bold uppercase tracking-wide text-white leading-tight line-clamp-2">{product.name}</p>
                <p className="text-xs font-black mt-auto" style={{ color: ACCENT }}>
                  {Number(product.price).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
