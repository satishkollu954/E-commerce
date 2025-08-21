import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { CartContext } from "./CartContext";
import { motion } from "framer-motion";

export function FitFusionCart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { setCartItems: updateCartContext } = useContext(CartContext);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/cart`, {
        withCredentials: true,
      });
      setCartItems(res.data.cart);
      updateCartContext(res.data.cart.map((item) => item.product._id));
    } catch {
      toast.error("Failed to fetch cart");
    }
  };

  const updateQuantity = async (productId, newQuantity, variantId, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/user/cart`,
        { productId, quantity: newQuantity, variantId },
        { withCredentials: true }
      );
      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId, variantId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/user/cart/${productId}/${variantId}`,
        { withCredentials: true }
      );
      toast.success("Removed from cart");
      fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () =>
    cartItems.reduce(
      (total, item) => total + item.variant.finalPrice * item.quantity,
      0
    );

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />
      <h3 className="mb-4">Your Cart</h3>

      {cartItems.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "70vh" }}
        >
          <img
            src="/shopping-cart.png"
            alt="Empty Cart"
            style={{ maxWidth: "250px", opacity: 0.8 }}
          />
          <p className="text-muted mt-3 ms-4 fs-5">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="row">
            {cartItems.map((item, index) => {
              const variant = item.variant;
              const imageUrl =
                variant.images?.[0] ||
                item.product.images?.[0] ||
                "/placeholder.png";

              return (
                <motion.div
                  key={item._id}
                  className="col-12 col-md-6 col-lg-4 mb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  <div className="card h-100 shadow-sm border-0 rounded-3">
                    <img
                      src={`${API_BASE_URL}${imageUrl}`}
                      alt={item.product.name}
                      className="card-img-top"
                      style={{
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "0.5rem 0.5rem 0 0",
                      }}
                    />
                    <div className="card-body p-3 d-flex flex-column">
                      <h6 className="card-title mb-1 text-truncate">
                        {item.product.name}
                      </h6>

                      <div className="text-muted small mb-1">
                        ₹{variant.finalPrice}{" "}
                        <s className="text-secondary">₹{variant.price}</s>
                      </div>

                      <div className="text-muted small mb-1">
                        {item.product.category === "child"
                          ? `Age Group: ${variant.childAgeGroup}`
                          : `Size: ${variant.size}`}
                      </div>

                      {variant.colors?.length > 0 && (
                        <div className="text-muted small mb-1">
                          Color: {variant.colors.join(", ")}
                        </div>
                      )}

                      <div className="d-flex align-items-center mb-2">
                        <button
                          className="btn btn-sm btn-light border me-2"
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1,
                              variant._id,
                              variant.stock
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-light border ms-2"
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1,
                              variant._id,
                              variant.stock
                            )
                          }
                          disabled={item.quantity >= variant.stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="fw-semibold small mb-2">
                        Total: ₹{variant.finalPrice * item.quantity}
                      </div>

                      <button
                        className="btn btn-sm btn-outline-danger mt-auto"
                        onClick={() =>
                          handleRemove(item.product._id, variant._id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="border-top pt-4 d-flex flex-column align-items-end">
            <h5 className="mb-2">Cart Total: ₹{calculateTotal()}</h5>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
