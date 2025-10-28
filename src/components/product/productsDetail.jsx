// src/components/product/productsDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProductsById,
  selectSelectedProduct,
  getProductsStatus,
  getProductsError,
} from "./productsSlice";
import {
  addToCart,
  syncCartToSupabase
} from "../cart/cartSlice";
import Comments from "./Comment";
import ErrorBoundary from "./ErrorBoundary";

const ProductsDetail = ({ user, cartItems }) => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const product = useSelector(selectSelectedProduct);
  const productStatus = useSelector(getProductsStatus);
  const productError = useSelector(getProductsError);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) dispatch(fetchProductsById(id));
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    if (user) await syncCartToSupabase(user.id, cartItems);
  };


  if (productStatus === "loading") return <p>Loading...</p>;
  if (productError) return <p>Error: {productError}</p>;
  if (!product) return <p>No product found.</p>;

  return (
    <div className="product-detail">
      <h2>{product.title}</h2>
      <img src={product.image} alt={product.title} />
      <h3>ETB{product.price}</h3>
      <p>{product.description}</p>

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <button onClick={handleAddToCart}>Add to Cart</button>


      <Link to="/">
        <button>Back to Products</button>
      </Link>

      {product.id && (
        <ErrorBoundary>
          <Comments productId={product.id} user={user} />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default ProductsDetail;
