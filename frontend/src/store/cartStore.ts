import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '../services/api';
import { toast } from 'sonner';

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
  loading: boolean;
  addItem: (product: any, quantity: number, variant?: any) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<any>;
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
      loading: false,

      fetchCart: async () => {
        set({ loading: true });
        try {
          const response = await cartApi.get();
          const cart = response.data.data.cart;
          
          if (cart.items && cart.items.length > 0) {
            const items = cart.items.map((item: any) => ({
              id: item._id,
              productId: item.productId?._id || item.productId,
              productName: item.productId?.name || 'Product',
              productPrice: item.price,
              productImage: item.productId?.images?.[0]?.url || 'https://placehold.co/200',
              quantity: item.quantity,
            }));
            
            set({ 
              items, 
              subtotal: cart.subtotal || 0, 
              total: cart.total || 0,
              discount: cart.discountAmount || 0,
              coupon: cart.couponCode ? { code: cart.couponCode } : undefined
            });
          } else {
            set({ items: [], subtotal: 0, total: 0, discount: 0, coupon: undefined });
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (product, quantity, variant) => {
        try {
          // Make sure we have the correct product ID
          const productId = product._id || product.id;
          
          const response = await cartApi.add({
            productId: productId,
            quantity: quantity,
            variantId: variant?.id
          });
          
          if (response.data.status === 'success') {
            await get().fetchCart();
            toast.success(`${product.name} added to cart`);
          }
        } catch (error: any) {
          console.error('Error adding to cart:', error);
          toast.error(error.response?.data?.message || 'Failed to add to cart');
          throw error;
        }
      },

      removeItem: async (itemId) => {
        try {
          await cartApi.remove(itemId);
          await get().fetchCart();
          toast.success('Item removed');
        } catch (error) {
          console.error('Error removing item:', error);
          toast.error('Failed to remove item');
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          await cartApi.updateQuantity(itemId, quantity);
          await get().fetchCart();
        } catch (error) {
          console.error('Error updating quantity:', error);
          toast.error('Failed to update cart');
        }
      },

      clearCart: async () => {
        try {
          await cartApi.clear();
          await get().fetchCart();
          toast.success('Cart cleared');
        } catch (error) {
          console.error('Error clearing cart:', error);
          toast.error('Failed to clear cart');
        }
      },

      applyCoupon: async (code) => {
        try {
          const response = await cartApi.applyCoupon(code);
          await get().fetchCart();
          toast.success('Coupon applied!');
          return response.data;
        } catch (error: any) {
          console.error('Error applying coupon:', error);
          toast.error(error.response?.data?.message || 'Failed to apply coupon');
          throw error;
        }
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
