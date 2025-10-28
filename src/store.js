// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./components/product/productsSlice";
import cartReducer from "./components/cart/cartSlice";

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
  },
});

export default store;
