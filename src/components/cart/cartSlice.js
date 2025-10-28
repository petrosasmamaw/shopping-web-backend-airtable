// src/components/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { supabase } from "../supabase/supabaseClient";

const initialState = {
  items: [], // {id, title, price, quantity, subtotal}
  totalPrice: 0,
};

// Local helper to calculate subtotal and total price
const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.subtotal, 0);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        existing.quantity += item.quantity || 1;
        existing.subtotal = existing.quantity * existing.price;
      } else {
        state.items.push({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          subtotal: item.price * (item.quantity || 1),
        });
      }

      state.totalPrice = calculateTotal(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.totalPrice = calculateTotal(state.items);
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          item.subtotal = item.price * item.quantity;
        } else {
          state.items = state.items.filter((i) => i.id !== item.id);
        }
      }
      state.totalPrice = calculateTotal(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },

    setCart: (state, action) => {
      state.items = action.payload;
      state.totalPrice = calculateTotal(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectTotalPrice = (state) => state.cart.totalPrice;

export default cartSlice.reducer;

// ✅ Supabase Sync Helpers
export const syncCartToSupabase = async (userId, items) => {
  if (!userId) return;

  // Only send allowed fields: user_id, cart_data, updated_at
  const { data, error } = await supabase
    .from("carts")
    .upsert(
      {
        user_id: userId,
        cart_data: items,
        updated_at: new Date().toISOString(), // generated columns like total_price are excluded
      },
      { onConflict: "user_id" }
    )
    .select();

  if (error) console.error("Error syncing cart:", error);
  return data;
};

export const fetchCartFromSupabase = async (userId) => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("carts")
    .select("cart_data")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  return data?.cart_data || [];
};
