// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar/navBar.jsx";
import ProductsList from "./components/product/productsList.jsx";
import ProductsDetail from "./components/product/productsDetail.jsx";
import Cart from "./components/cart/Cart.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import { supabase } from "./components/supabase/supabaseClient.js";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartFromSupabase,
  setCart,
  selectCartItems,
  syncCartToSupabase,
} from "./components/cart/cartSlice";

const App = () => {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  // ✅ Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ Sync cart with Supabase when user logs in
  useEffect(() => {
    const handleUserCart = async () => {
      if (user) {
        const savedCart = await fetchCartFromSupabase(user.id);
        dispatch(setCart(savedCart));
      }
    };
    handleUserCart();
  }, [user, dispatch]);

  // ✅ Save cart changes if user logged in
  useEffect(() => {
    if (user) syncCartToSupabase(user.id, cartItems);
  }, [cartItems, user]);

  return (
    <div className="app">
      <NavBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<ProductsList />} />
        <Route path="/products/:id" element={<ProductsDetail user={user} cartItems={cartItems} />} />
        <Route path="/cart" element={<Cart user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
