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
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "70vh" }}
        >
          <img
            src="/shopping-cart.png"
            alt="Empty Cart"
            style={{ maxWidth: "250px", opacity: 0.8 }}
          />
          <p className="text-muted mt-3 ms-5 fs-5">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="row">
            {cartItems.map((item) => (
              <div className="col-12 col-md-6 col-lg-4 mb-3" key={item._id}>
                <div className="card h-100 shadow-sm border-0 rounded-3">
                  <img
                    src={`http://localhost:3005${item.product.images?.[0]}`}
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
                      ₹{item.product.finalPrice}{" "}
                      <s className="text-secondary">₹{item.product.price}</s>
                    </div>

                    <div className="text-muted small mb-1">
                      Size: {item.size}
                      {item.product.category === "child" ? " years" : ""}
                    </div>

                    <div className="text-muted small mb-2">
                      Discount: {item.product.discount}%
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <button
                        className="btn btn-sm btn-light border me-2"
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
                      <span className="px-2">{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-light border ms-2"
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

                    <div className="fw-semibold small mb-2">
                      Total: ₹{item.product.finalPrice * item.quantity}
                    </div>

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
