import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { CartContext } from "./CartContext";

export function FitFusionWishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { cartItems, setCartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/wishlist`, {
        withCredentials: true,
      });
      setWishlistItems(res.data.wishlist);
    } catch (error) {
      toast.error("Failed to fetch wishlist", error.message);
    }
  };

  const handleRemove = async (productId, variantId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/user/wishlist/${productId}/${variantId}`,
        { withCredentials: true }
      );

      setWishlistItems((prevItems) =>
        prevItems.filter(
          (item) =>
            item.product && // :white_tick: check product exists
            (item.product._id !== productId || item.variantId !== variantId)
        )
      );

      toast.success("Item removed from wishlist");
    } catch (error) {
      toast.error("Error removing item from wishlist", error.message);
    }
  };

  const handleAddToCart = async (item) => {
    const { product, variantId } = item;
    const isAlreadyInCart = cartItems.some(
      (cartItem) =>
        cartItem?.product?._id === product._id &&
        cartItem?.variant?._id === variantId
    );

    if (!isAlreadyInCart) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/user/cart`,
          {
            productId: product._id,
            variantId,
            quantity: 1,
          },
          { withCredentials: true }
        );

        setCartItems([
          ...cartItems,
          { product: product, variant: { _id: variantId } },
        ]);

        handleRemove(product._id, variantId);
        toast.success("Added to cart");
      } catch (error) {
        console.error("Cart API Error:", error.message);
        toast.error("Failed to add to cart");
      }
    } else {
      toast.info("This size is already in your cart");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h3>Your Wishlist</h3>
      <div className="row">
        {wishlistItems.map((item) => {
          const { product, variantId } = item;

          const variant = product?.variants?.find((v) => v._id === variantId);

          if (!variant) return null;

          const originalPrice = variant.price || 0;
          const discount = variant.discount || 0;
          const finalPrice = Math.round(
            originalPrice - (originalPrice * discount) / 100
          );

          return (
            <div className="col-md-4 mb-4" key={item._id}>
              <div className="card h-100">
                <img
                  src={`${API_BASE_URL}${product.images?.[0]}`}
                  alt={product.name}
                  className="card-img-top"
                  style={{
                    cursor: "pointer",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>

                  <p className="card-text mb-1">
                    <strong>Price:</strong>{" "}
                    <span
                      style={{
                        textDecoration: discount > 0 ? "line-through" : "none",
                      }}
                    >
                      ₹{originalPrice}
                    </span>{" "}
                    {discount > 0 && (
                      <span className="text-success ms-2">
                        ₹{finalPrice} ({discount}% OFF)
                      </span>
                    )}
                  </p>

                  {product.category === "child" && variant.childAgeGroup && (
                    <p className="card-text mb-1">
                      <strong>Age Group:</strong> {variant.childAgeGroup} years
                    </p>
                  )}

                  {(product.category === "men" ||
                    product.category === "women") &&
                    variant.size && (
                      <p className="card-text mb-1">
                        <strong>Size:</strong> {variant.size}
                      </p>
                    )}

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(product._id, variant._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {wishlistItems.length === 0 ||
          (wishlistItems == null && (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ minHeight: "75vh" }}
            >
              <img
                src="/wishlist.png"
                alt="Empty Wishlist"
                style={{ maxWidth: "250px", opacity: 0.8 }}
              />
              <p className="text-muted mt-3 fs-5">Your wishlist is empty.</p>
            </div>
          ))}
      </div>
    </div>
  );
}
