import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api'
import { ACCENT } from './AdminNav'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { token } = await adminApi.auth(password)
      localStorage.setItem('admin_token', token)
      navigate('/admin/orders')
    } catch {
      setError('Неверный пароль')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm border border-zinc-800 p-8" style={{ background: '#141414' }}>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white text-center mb-8">
          Панель управления
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ background: '#0a0a0a', color: '#fff', border: '1px solid #2a2a2a' }}
              className="w-full outline-none px-4 py-3 text-sm"
              placeholder="Введите пароль" autoFocus />
          </div>
          {error && <p className="text-xs" style={{ color: ACCENT }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 text-sm font-black uppercase tracking-widest disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: ACCENT, color: '#fff' }}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
