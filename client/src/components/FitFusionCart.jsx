import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext";

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
      setCartItems(res.data.cart);
      updateCartContext(res.data.cart.map((item) => item.product._id));
    } catch (error) {
      toast.error("Failed to fetch cart");
    }
  };

  const updateQuantity = async (productId, newQuantity, size) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://localhost:3005/api/user/cart`,
        { productId, quantity: newQuantity, size },
        { withCredentials: true }
      );
      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId, size) => {
    try {
      await axios.delete(
        `http://localhost:3005/api/user/cart/${productId}/${size}`,
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
      (total, item) => total + item.product.finalPrice * item.quantity,
      0
    );

  return (
    <div className="container py-4">
      <h3 className="mb-4">Your Cart</h3>

      {cartItems.length === 0 ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <>
          <div className="row">
            {cartItems.map((item) => (
              <div className="col-md-6 col-lg-4 mb-4" key={item._id}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={`http://localhost:3005${item.product.images?.[0]}`}
                    alt={item.product.name}
                    className="card-img-top"
                    style={{
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{item.product.name}</h5>
                    <p className="card-text mb-1">
                      Price: ₹{item.product.finalPrice}{" "}
                      <small className="text-muted text-decoration-line-through">
                        ₹{item.product.price}
                      </small>
                    </p>
                    <p className="card-text mb-1">Size: {item.size} years</p>
                    <p className="card-text mb-1">
                      Discount: {item.product.discount}%
                    </p>

                    <div className="d-flex align-items-center my-2">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity - 1,
                            item.size
                          )
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity + 1,
                            item.size
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <h6 className="fw-bold mb-2">
                      Total: ₹{item.product.finalPrice * item.quantity}
                    </h6>

                    <button
                      className="btn btn-sm btn-outline-danger mt-auto"
                      onClick={() => handleRemove(item.product._id, item.size)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-top pt-4 d-flex flex-column align-items-end">
            <h5 className="mb-2">Cart Total: ₹{calculateTotal()}</h5>
            <button
              className="btn btn-primary"
              onClick={() => toast.success("Checkout initiated")}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
