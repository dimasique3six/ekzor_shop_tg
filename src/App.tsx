import { HashRouter, Routes, Route } from "react-router-dom"
import { useEffect } from 'react'
import CatalogPage      from './pages/CatalogPage'
import CartPage         from './pages/CartPage'
import CheckoutPage     from './pages/CheckoutPage'
import SuccessPage      from './pages/SuccessPage'
import AdminLoginPage   from './pages/admin/AdminLoginPage'
import AdminOrdersPage  from './pages/admin/AdminOrdersPage'
import AdminProductsPage    from './pages/admin/AdminProductsPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'

export default function App() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) { tg.ready(); tg.expand() }
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route path="/"             element={<CatalogPage />} />
        <Route path="/cart"         element={<CartPage />} />
        <Route path="/checkout"     element={<CheckoutPage />} />
        <Route path="/success/:id"  element={<SuccessPage />} />
        <Route path="/admin"                    element={<AdminLoginPage />} />
        <Route path="/admin/orders"             element={<AdminOrdersPage />} />
        <Route path="/admin/products"           element={<AdminProductsPage />} />
        <Route path="/admin/products/new"       element={<AdminProductFormPage />} />
        <Route path="/admin/products/:id/edit"  element={<AdminProductFormPage />} />
      </Routes>
    </HashRouter>
  )
}
