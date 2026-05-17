import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  variantId?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  discount: number;
  coupon: any;
  addItem: (product: any, quantity: number, variant?: any) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: any[]) => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      total: 0,
      discount: 0,
      coupon: undefined,

      addItem: (product, quantity, variant) => {
        const existingItem = get().items.find(
          (item) => item.productId === product.id && item.variantId === variant?.id
        );

        let newItems;
        if (existingItem) {
          newItems = get().items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productImage: product.images?.[0] || 'https://placehold.co/200',
            quantity: quantity,
            variantId: variant?.id,
          };
          newItems = [...get().items, newItem];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeItem: (itemId) => {
        const newItems = get().items.filter((item) => item.id !== itemId);
        set({ items: newItems });
        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        const newItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: newItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, total: 0, discount: 0, coupon: undefined });
      },

      setCart: (items) => {
        set({ items });
        get().calculateTotals();
      },

      calculateTotals: () => {
        const { items, discount } = get();
        const subtotal = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
        const total = subtotal - discount;
        set({ subtotal, total });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
