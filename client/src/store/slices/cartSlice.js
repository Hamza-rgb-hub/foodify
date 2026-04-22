import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ foodId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', { foodId, quantity });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ foodId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/cart/update', { foodId, quantity });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (foodId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/remove/${foodId}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCartAsync = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/clear');
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const setItems = (state, action) => {
      state.loading = false;
      state.items = action.payload || [];
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setItems)
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, setItems)
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateCartItem.fulfilled, setItems)
      .addCase(removeFromCart.fulfilled, setItems)
      .addCase(clearCartAsync.fulfilled, setItems);
  },
});

export const { clearCartLocal } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, item) => {
  const price = item.food?.discountedPrice || item.food?.price || 0;
  return sum + price * item.quantity;
}, 0);

export default cartSlice.reducer;
