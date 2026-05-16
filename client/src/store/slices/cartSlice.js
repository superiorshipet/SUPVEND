import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '@/api/endpoints';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.get();
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (itemData, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.addItem(itemData);
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, ...updateData }, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.updateItem(itemId, updateData);
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.removeItem(itemId);
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
  }
});

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (couponData, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.applyCoupon(couponData);
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Invalid coupon');
  }
});

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.removeCoupon();
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartAPI.clear();
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    coupon: null,
    discount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      state.coupon = null;
      state.discount = 0;
    },
  },
  extraReducers: (builder) => {
    const handleCartResponse = (state, action) => {
      const cart = action.payload?.cart || action.payload;
      if (cart) {
        state.items = cart.items || [];
        state.totalAmount = cart.totalAmount || 0;
        state.totalItems = cart.items?.length || 0;
        state.coupon = cart.coupon || null;
        state.discount = cart.discount || 0;
      }
      state.isLoading = false;
      state.error = null;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, handleCartResponse)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => { state.isLoading = true; })
      .addCase(addToCart.fulfilled, handleCartResponse)
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItem.fulfilled, handleCartResponse)
      .addCase(removeCartItem.fulfilled, handleCartResponse)
      .addCase(applyCoupon.fulfilled, handleCartResponse)
      .addCase(removeCoupon.fulfilled, handleCartResponse)
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalAmount = 0;
        state.totalItems = 0;
        state.coupon = null;
        state.discount = 0;
        state.isLoading = false;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
