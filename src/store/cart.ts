import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '../types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number, selectedVariants: Record<string, string>) => void
  updateQuantity: (index: number, qty: number) => void
  removeItem: (index: number) => void
  clear: () => void
  getTotal: () => number
}

function itemKey(productId: number, variants: Record<string, string>) {
  return JSON.stringify({ productId, variants })
}

function calcItemPrice(item: CartItem): number {
  let price = Number(item.product.price)
  if (item.selectedVariants && item.product.variants) {
    for (const [vName, vVal] of Object.entries(item.selectedVariants)) {
      const def = item.product.variants.find(v => v.name === vName)
      const val = def?.values.find(v => v.label === vVal)
      if (val) price += val.priceDiff
    }
  }
  return price
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, selectedVariants) => set(state => {
        const key = itemKey(product.id, selectedVariants)
        const idx = state.items.findIndex(i => itemKey(i.product.id, i.selectedVariants) === key)
        if (idx >= 0) {
          const items = [...state.items]
          items[idx] = { ...items[idx], quantity: Math.min(99, items[idx].quantity + quantity) }
          return { items }
        }
        if (state.items.length >= 20) return state
        return { items: [...state.items, { product, quantity, selectedVariants }] }
      }),
      updateQuantity: (index, qty) => set(state => {
        const items = [...state.items]
        items[index] = { ...items[index], quantity: Math.max(1, Math.min(99, qty)) }
        return { items }
      }),
      removeItem: index => set(state => ({ items: state.items.filter((_, i) => i !== index) })),
      clear: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + calcItemPrice(item) * item.quantity, 0)
    }),
    { name: 'tma-cart' }
  )
)

export { calcItemPrice }
