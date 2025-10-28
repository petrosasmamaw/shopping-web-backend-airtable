// src/components/cart/SendOrder.jsx
import React, { useState } from "react";
import emailjs from "emailjs-com";
import { useDispatch } from "react-redux";
import { clearCart } from "./cartSlice";
import { supabase } from "../supabase/supabaseClient";

const SendOrder = ({ user, cartItems, totalPrice }) => {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  const handleSendOrder = async () => {
    if (!user || !user.id || !user.email) {
      alert("Please log in first!");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsSending(true);

    // Create order summary string for email
    const orderSummary = cartItems
      .map((item) => `${item.title} (x${item.quantity}) - $${item.price}`)
      .join("\n");

    // Create an array of item names for database
    const itemNames = cartItems.map(item => item.title);

    const orderDate = new Date().toISOString();

    try {
      // 1️⃣ Send invoice to customer
      await emailjs.send(
        "service_f9p0p7b",
        "template_5xv3bke",
        {
          to_name: user.name || user.email,
          to_email: user.email,
          order_summary: orderSummary,
          total_price: totalPrice.toFixed(2),
          order_date: new Date().toLocaleString(),
        },
        "BeGy3nai4D3iywEnN"
      );

      // 2️⃣ Send notification to admin
      await emailjs.send(
        "service_f9p0p7b",
        "template_dsaauta",
        {
          customer_email: user.email,
          order_summary: orderSummary,
          total_price: totalPrice.toFixed(2),
        },
        "BeGy3nai4D3iywEnN"
      );

      // 3️⃣ Save order to Supabase
      const { error } = await supabase.from("orders").insert([
        {
          user_id: user.id,
          user_email: user.email,
          cart_data: cartItems,
          item_names: itemNames,        // store item names
          total_price: totalPrice,
          order_date: orderDate,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Failed to save order to database!");
      } else {
        alert("✅ Invoice sent & order saved!");
        dispatch(clearCart());
      }
    } catch (error) {
      console.error("SendOrder error:", error);
      alert("Failed to send order or save to database");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSendOrder}
      disabled={isSending}
      className={`px-4 py-2 rounded-lg text-white ${
        isSending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isSending ? "Sending..." : "Send Order"}
    </button>
  );
};

export default SendOrder;
