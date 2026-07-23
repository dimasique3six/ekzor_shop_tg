import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../api'
import { ACCENT } from './AdminNav'

const API = import.meta.env.VITE_API_URL || ''
const CATEGORIES = ['кассеты', 'винил', 'футболки', 'худи', 'аксессуары', 'другое']

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
  const [category, setCategory] = useState('')
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
      setCategory((p as any).category || '')
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
    } finally { setUploadingIdx(null) }
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
      category: category || null,
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

  const inpStyle = { background: '#0a0a0a', color: '#fff', border: '1px solid #2a2a2a' }
  const inp = "w-full outline-none px-3 py-2.5 text-sm"
  const label = "block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2"
  const panel = "border border-zinc-800 p-6 space-y-4"

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-zinc-800" style={{ background: '#0a0a0a' }}>
        <button onClick={() => navigate('/admin/products')} className="text-zinc-400 hover:text-white transition-colors text-xl">←</button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">
          {isEdit ? 'Редактировать товар' : 'Новый товар'}
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div className={panel}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Основное</h2>
          <div>
            <label className={label}>Название *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inpStyle} className={inp} placeholder="Название товара" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className={label}>Цена (₽) *</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} style={inpStyle} className={inp} placeholder="1500" />
            </div>
            <div className="flex-1 min-w-32">
              <label className={label}>
                Кол-во <span className="text-zinc-600 normal-case font-normal">(пусто = ∞)</span>
              </label>
              <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} style={inpStyle} className={inp} placeholder="50" />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className={label}>Категория</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inpStyle} className={inp}>
                <option value="">— Без категории —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Статус</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} style={inpStyle} className={inp}>
                <option value="available">В наличии</option>
                <option value="unavailable">Нет в наличии</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Описание</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              style={{ ...inpStyle, resize: 'none' }} className={inp} placeholder="Описание товара (необязательно)" />
          </div>
        </div>

        <div className={panel}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Изображения (до 5 штук)</h2>
          {images.map((url, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2 items-center">
                <input value={url} onChange={e => setImg(i, e.target.value)} style={inpStyle} className={`${inp} flex-1`}
                  placeholder="URL или загрузи файл →" />
                <button onClick={() => { (fileRef.current as any)._idx = i; fileRef.current?.click() }}
                  disabled={uploadingIdx !== null}
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  className="px-3 py-2.5 hover:bg-zinc-800 text-sm font-medium whitespace-nowrap disabled:opacity-50 text-zinc-300 transition-colors">
                  {uploadingIdx === i ? '...' : '📁 Файл'}
                </button>
                {images.length > 1 && (
                  <button onClick={() => removeImg(i)} className="text-zinc-600 hover:text-fuchsia-400 px-1 transition-colors">✕</button>
                )}
              </div>
              {url && <img src={url} alt="" className="h-20 w-20 object-cover border border-zinc-800" />}
            </div>
          ))}
          {images.length < 5 && (
            <button onClick={addImg} className="text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: ACCENT }}>+ Ещё изображение</button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              const idx = (e.target as any)._idx ?? 0
              if (file) uploadFile(idx, file)
              e.target.value = ''
            }} />
        </div>

        <div className={panel}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Варианты</h2>
              <p className="text-xs text-zinc-600 mt-1">Например: Размер (S/M/L), Цвет. Наценка — доплата за вариант.</p>
            </div>
            <button onClick={addVariant} className="text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: ACCENT }}>+ Добавить</button>
          </div>
          {variants.map((v, vi) => (
            <div key={vi} className="border border-zinc-800 p-4 space-y-3">
              <div className="flex gap-2 items-center">
                <input value={v.name} onChange={e => setVarName(vi, e.target.value)}
                  style={inpStyle} className={`${inp} flex-1`} placeholder="Название (напр. Размер)" />
                <button onClick={() => removeVariant(vi)} className="text-zinc-600 hover:text-fuchsia-400 transition-colors">✕</button>
              </div>
              <div className="space-y-2">
                {v.values.map((val, ji) => (
                  <div key={ji} className="flex gap-2 items-center">
                    <input value={val.label} onChange={e => setVarValue(vi, ji, 'label', e.target.value)}
                      style={inpStyle} className={`${inp} flex-1`} placeholder="Значение (напр. M)" />
                    <input type="number" value={val.priceDiff}
                      onChange={e => setVarValue(vi, ji, 'priceDiff', e.target.value)}
                      style={inpStyle} className={`${inp} w-32`} placeholder="Наценка ₽" />
                    {v.values.length > 1 && (
                      <button onClick={() => removeVarValue(vi, ji)} className="text-zinc-600 hover:text-fuchsia-400 transition-colors">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => addVarValue(vi)} className="text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: ACCENT }}>+ Значение</button>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs py-3 px-4 border" style={{ color: ACCENT, borderColor: ACCENT, background: 'rgba(227,84,255,0.05)' }}>
            {error}
          </p>
        )}

        <button onClick={save} disabled={saving}
          className="w-full py-4 text-sm font-black uppercase tracking-widest disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: ACCENT, color: '#fff' }}>
          {saving ? 'Сохраняем...' : (isEdit ? 'Сохранить изменения' : 'Создать товар')}
        </button>
      </div>
    </div>
  )
}
