import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCartStore } from '../store/cart'
import type { Product, ProductVariant } from '../types'

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty]       = useState(1)
  const [variants, setVariants] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    product.variants?.forEach(v => { if (v.values[0]) init[v.name] = v.values[0].label })
    return init
  })
  const addItem = useCartStore(s => s.addItem)

  const basePrice = Number(product.price)
  const extraPrice = product.variants
    ? product.variants.reduce((sum, v) => {
        const sel = variants[v.name]
        const val = v.values.find(x => x.label === sel)
        return sum + (val?.priceDiff ?? 0)
      }, 0)
    : 0
  const totalPrice = (basePrice + extraPrice) * qty

  function handleAdd() {
    addItem(product, qty, variants)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--tg-theme-bg-color,#fff)' }}>
      {/* Шапка */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={onClose} className="mr-3 text-2xl leading-none">←</button>
        <h2 className="text-base font-semibold truncate flex-1">{product.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Изображения */}
        {product.images.length > 0 && (
          <div className="relative bg-gray-100">
            <img src={product.images[imgIdx]} alt={product.name}
              className="w-full object-cover" style={{ maxHeight: 320, objectFit: 'cover' }} />
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-4 space-y-4">
          {/* Цена */}
          <div className="text-2xl font-bold">{totalPrice.toLocaleString('ru-RU')} ₽</div>

          {/* Описание */}
          {product.description && (
            <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color,#888)' }}>{product.description}</p>
          )}

          {/* Варианты */}
          {product.variants?.map((variant: ProductVariant) => (
            <div key={variant.name}>
              <div className="text-sm font-medium mb-2">{variant.name}</div>
              <div className="flex flex-wrap gap-2">
                {variant.values.map(v => (
                  <button key={v.label} onClick={() => setVariants(prev => ({ ...prev, [variant.name]: v.label }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      variants[variant.name] === v.label
                        ? 'border-transparent text-white' : 'border-gray-300'
                    }`}
                    style={variants[variant.name] === v.label
                      ? { background: 'var(--tg-theme-button-color,#2481cc)', color: 'var(--tg-theme-button-text-color,#fff)' }
                      : {}}>
                    {v.label}{v.priceDiff !== 0 && ` ${v.priceDiff > 0 ? '+' : ''}${v.priceDiff} ₽`}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Количество */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Количество</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)' }}>−</button>
              <span className="text-base font-semibold w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(99, q + 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)' }}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка */}
      <div className="px-4 pb-6 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <button onClick={handleAdd}
          className="w-full py-3.5 rounded-xl text-base font-semibold"
          style={{ background: 'var(--tg-theme-button-color,#2481cc)', color: 'var(--tg-theme-button-text-color,#fff)' }}>
          Добавить в корзину — {totalPrice.toLocaleString('ru-RU')} ₽
        </button>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<Product | null>(null)
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))

  useEffect(() => {
    api.products.list().then(setProducts).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--tg-theme-button-color,#2481cc)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--tg-theme-bg-color,#fff)' }}>
      {/* Шапка */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--tg-theme-bg-color,#fff)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <h1 className="text-lg font-bold">Каталог</h1>
        <button onClick={() => navigate('/cart')} className="relative p-1">
          <span className="text-2xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
              style={{ background: 'var(--tg-theme-button-color,#2481cc)' }}>{cartCount}</span>
          )}
        </button>
      </header>

      {/* Сетка товаров */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 gap-3">
          <span className="text-5xl">📦</span>
          <p style={{ color: 'var(--tg-theme-hint-color,#888)' }}>Товары пока не добавлены</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-3">
          {products.map(product => (
            <button key={product.id} onClick={() => product.status === 'available' && setSelected(product)}
              className="rounded-2xl overflow-hidden text-left transition-opacity"
              style={{ background: 'var(--tg-theme-secondary-bg-color,#f2f2f7)', opacity: product.status === 'unavailable' ? 0.6 : 1 }}>
              <div className="relative bg-gray-200" style={{ paddingTop: '100%' }}>
                {product.images[0]
                  ? <img src={product.images[0]} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-4xl">🖼</div>
                }
                {product.status === 'unavailable' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded">Нет в наличии</span>
                  </div>
                )}
              </div>
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                <p className="mt-1 text-sm font-bold" style={{ color: 'var(--tg-theme-link-color,#2481cc)' }}>
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
