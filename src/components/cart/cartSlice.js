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

  // NOTE: Avoid upsert with onConflict unless a unique constraint exists on user_id.
  // Fallback strategy:
  // 1) Try to find an existing cart row for this user.
  // 2) If found, update it by primary key (id). If not found, insert a new row.
  try {
    const timestamp = new Date().toISOString();
    const payload = { user_id: userId, cart_data: items, updated_at: timestamp };

    // Find latest existing cart for this user (if duplicates exist, prefer most recent)
    const { data: existingRows, error: findErr } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (findErr) {
      console.error("Error locating existing cart:", findErr);
      return null;
    }

    if (existingRows && existingRows.length > 0) {
      const existingId = existingRows[0].id;
      const { data: updated, error: updateErr } = await supabase
        .from("carts")
        .update({ cart_data: items, updated_at: timestamp })
        .eq("id", existingId)
        .select();

      if (updateErr) {
        console.error("Error updating cart:", updateErr);
        return null;
      }
      return updated;
    } else {
      // If no existing cart row and items are empty, skip inserting a blank cart
      if (!items || items.length === 0) {
        return [];
      }
      const { data: inserted, error: insertErr } = await supabase
        .from("carts")
        .insert(payload)
        .select();

      if (insertErr) {
        console.error("Error inserting cart:", insertErr);
        return null;
      }
      return inserted;
    }
  } catch (e) {
    console.error("Unexpected error syncing cart:", e);
    return null;
  }
};


export const fetchCartFromSupabase = async (userId) => {
  if (!userId) return [];

  // In case multiple rows exist for a user (no unique constraint), prefer latest by updated_at
  const { data, error } = await supabase
    .from("carts")
    .select("cart_data, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  return data?.cart_data || [];
};
