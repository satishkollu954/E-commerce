import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext"; // if you manage count globally

export function FitFusionCart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { setCartItems: updateCartContext } = useContext(CartContext);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:3005/api/user/cart`, {
        withCredentials: true,
      });
      console.log("Cart items fetched:", res.data);
      const { cart, totalPrice } = res.data;
      // console.log("Fetched cart:", cart);
      setCartItems(cart);
      updateCartContext(cart.map((item) => item.product._id)); // for badge
    } catch (error) {
      toast.error("Failed to fetch cart");
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(
        `http://localhost:3005/api/user/cart`,
        { productId, quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:3005/api/user/cart/${productId}`, {
        withCredentials: true,
      });
      toast.success("Removed from cart");
      fetchCart();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <div className="container mt-4 vh-100">
      <h3>Your Cart</h3>
      <div className="row">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div className="col-md-4 mb-4" key={item._id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={`http://localhost:3005${item.product.images?.[0]}`}
                  alt={item.product.name}
                  className="card-img-top"
                  style={{
                    cursor: "pointer",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{item.product.name}</h5>
                  <p className="card-text">₹{item.product.price}</p>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="fw-bold">
                      <h5>Total: ₹{item.product.price * item.quantity}</h5>
                    </span>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={() => handleRemove(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">Your cart is empty.</p>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-4 text-end">
          <h5>Total: ₹{calculateTotal()}</h5>
          <button
            className="btn btn-primary mt-2"
            onClick={() => toast.success("Checkout initiated")}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
