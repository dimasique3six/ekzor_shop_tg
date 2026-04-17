import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../api'

const API = import.meta.env.VITE_API_URL || ''

interface VariantValue { label: string; priceDiff: number }
interface Variant { name: string; values: VariantValue[] }

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const [name,     setName]     = useState('')
  const [price,    setPrice]    = useState('')
  const [stock,    setStock]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [images,   setImages]   = useState<string[]>([''])
  const [status,   setStatus]   = useState<'available' | 'unavailable'>('available')
  const [variants, setVariants] = useState<Variant[]>([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!isEdit) return
    adminApi.products.list().then(ps => {
      const p = ps.find(x => x.id === Number(id))
      if (!p) return
      setName(p.name); setPrice(String(Number(p.price)))
      setStock((p as any).stock != null ? String((p as any).stock) : '')
      setDesc(p.description || ''); setStatus(p.status)
      setImages(p.images.length > 0 ? p.images : [''])
      setVariants((p.variants as Variant[]) || [])
    }).catch(() => navigate('/admin/products'))
  }, [id])

  async function uploadFile(idx: number, file: File) {
    setUploadingIdx(idx)
    try {
      const form = new FormData()
      form.append('file', file)
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImages(imgs => { const c = [...imgs]; c[idx] = data.url; return c })
    } catch (e: any) {
      setError('Ошибка загрузки: ' + e.message)
    } finally {
      setUploadingIdx(null)
    }
  }

  function addVariant() { setVariants(v => [...v, { name: '', values: [{ label: '', priceDiff: 0 }] }]) }
  function removeVariant(i: number) { setVariants(v => v.filter((_, j) => j !== i)) }
  function setVarName(i: number, n: string) { setVariants(v => { const c = [...v]; c[i] = { ...c[i], name: n }; return c }) }
  function addVarValue(vi: number) {
    setVariants(v => { const c = [...v]; c[vi] = { ...c[vi], values: [...c[vi].values, { label: '', priceDiff: 0 }] }; return c })
  }
  function removeVarValue(vi: number, ji: number) {
    setVariants(v => { const c = [...v]; c[vi] = { ...c[vi], values: c[vi].values.filter((_, j) => j !== ji) }; return c })
  }
  function setVarValue(vi: number, ji: number, field: 'label' | 'priceDiff', val: string) {
    setVariants(v => {
      const c = [...v]; const vals = [...c[vi].values]
      vals[ji] = { ...vals[ji], [field]: field === 'priceDiff' ? Number(val) : val }
      c[vi] = { ...c[vi], values: vals }; return c
    })
  }
  function setImg(i: number, val: string) { setImages(imgs => { const c = [...imgs]; c[i] = val; return c }) }
  function addImg() { if (images.length < 5) setImages(i => [...i, '']) }
  function removeImg(i: number) { setImages(imgs => imgs.filter((_, j) => j !== i)) }

  async function save() {
    if (!name.trim() || !price.trim()) { setError('Название и цена обязательны'); return }
    setSaving(true); setError('')
    const payload = {
      name: name.trim(), price: Number(price),
      stock: stock !== '' ? Number(stock) : null,
      description: desc.trim() || null,
      images: images.filter(Boolean), status,
      variants: variants.length > 0 ? variants : null
    }
    try {
      if (isEdit) await adminApi.products.update(Number(id), payload)
      else await adminApi.products.create(payload)
      navigate('/admin/products')
    } catch (e: any) { setError(e.message || 'Ошибка сохранения') }
    finally { setSaving(false) }
  }

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <h1 className="text-xl font-bold">{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-700">Основное</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Название *</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inp} placeholder="Название товара" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Цена (₽) *</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className={inp} placeholder="1500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Количество <span className="text-xs text-gray-400">(пусто = ∞)</span>
              </label>
              <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className={inp} placeholder="50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Статус</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className={inp}>
                <option value="available">В наличии</option>
                <option value="unavailable">Нет в наличии</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Описание</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className={inp} style={{ resize: 'none' }} placeholder="Описание товара (необязательно)" />
          </div>
        </div>

        {/* Изображения */}
        <div className="bg-white rounded-xl p-6 space-y-3 shadow-sm">
          <h2 className="font-semibold text-gray-700">Изображения (до 5 штук)</h2>
          {images.map((url, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2 items-center">
                <input value={url} onChange={e => setImg(i, e.target.value)} className={`${inp} flex-1`}
                  placeholder="URL картинки или загрузи файл →" />
                <button onClick={() => { (fileRef.current as any)._idx = i; fileRef.current?.click() }}
                  disabled={uploadingIdx !== null}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50">
                  {uploadingIdx === i ? '...' : '📁 Файл'}
                </button>
                {images.length > 1 && (
                  <button onClick={() => removeImg(i)} className="text-red-400 hover:text-red-600 px-1">✕</button>
                )}
              </div>
              {url && (
                <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
              )}
            </div>
          ))}
          {images.length < 5 && (
            <button onClick={addImg} className="text-sm text-blue-500 hover:text-blue-700">+ Ещё изображение</button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              const idx = (e.target as any)._idx ?? 0
              if (file) uploadFile(idx, file)
              e.target.value = ''
            }} />
        </div>

        {/* Варианты */}
        <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Варианты</h2>
            <button onClick={addVariant} className="text-sm text-blue-500 hover:text-blue-700">+ Добавить вариант</button>
          </div>
          {variants.length === 0 && <p className="text-sm text-gray-400">Например: Размер, Цвет.</p>}
          {variants.map((v, vi) => (
            <div key={vi} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2 items-center">
                <input value={v.name} onChange={e => setVarName(vi, e.target.value)}
                  className={`${inp} flex-1`} placeholder="Название варианта (напр. Размер)" />
                <button onClick={() => removeVariant(vi)} className="text-red-400 hover:text-red-600">✕</button>
              </div>
              <div className="space-y-2">
                {v.values.map((val, ji) => (
                  <div key={ji} className="flex gap-2 items-center">
                    <input value={val.label} onChange={e => setVarValue(vi, ji, 'label', e.target.value)}
                      className={`${inp} flex-1`} placeholder="Значение (напр. M)" />
                    <input type="number" value={val.priceDiff} onChange={e => setVarValue(vi, ji, 'priceDiff', e.target.value)}
                      className={`${inp} w-28`} placeholder="Доплата ₽" />
                    {v.values.length > 1 && (
                      <button onClick={() => removeVarValue(vi, ji)} className="text-gray-400 hover:text-red-500">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => addVarValue(vi)} className="text-xs text-blue-500 hover:text-blue-700">+ Добавить значение</button>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

        <button onClick={save} disabled={saving}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-60">
          {saving ? 'Сохраняем...' : (isEdit ? 'Сохранить изменения' : 'Создать товар')}
        </button>
      </div>
    </div>
  )
}
