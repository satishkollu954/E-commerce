// src/components/Payment.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import PaymentTimer from "./PaymentTimer";

export function FitFusionPayment() {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("Online");
  const location = useLocation();
  const navigate = useNavigate();
  const { setCartItems: updateCartContext } = useContext(CartContext);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const {
    cartItems = [],
    selectedAddress,
    totalAmount = 0,
    shipping = 0,
  } = location.state || {};

  // Calculate payable amount (incl. shipping)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.variant.finalPrice * item.quantity,
    0
  );
  const shippingFee = subtotal < 500 ? 50 : 0;
  const payableAmount = subtotal + shippingFee;

  // 🛒 Handle Razorpay Online Payment
  const handleRazorpayPayment = async () => {
    if (!selectedAddress) return toast.error("Select a shipping address");
    if (cartItems.length === 0) return toast.error("Cart is empty");

    try {
      setLoading(true);
      // console.log("Processing Razorpay payment...", razorpay_order_id);
      // 1️⃣ Create Razorpay Order in backend
      const res = await axios.post(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          products: cartItems.map((item) => ({
            product: item.product._id,
            variantId: item.variant._id,
            quantity: item.quantity,
          })),
          shippingAddress: selectedAddress,
          totalAmount: payableAmount,
        },
        { withCredentials: true }
      );
      console.log("Razorpay order created:", res.data);

      const { id: razorpay_order_id, verifiedAmount } = res.data;

      // 2️⃣ Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: verifiedAmount * 100, // convert to paise
        currency: "INR",
        name: "FitFusion Store",
        description: "Order Payment",
        order_id: razorpay_order_id,
        handler: async function (response) {
          // console.log("Payment response:", response);
          navigate("/success");
          try {
            // 3️⃣ Verify payment in backend
            await axios.post(
              `${API_BASE_URL}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                products: cartItems.map((item) => ({
                  product: item.product._id,
                  variantId: item.variant._id,
                  quantity: item.quantity,
                })),
                shippingAddress: selectedAddress,
                totalAmount: payableAmount,
                paymentType: "Online",
              },
              { withCredentials: true }
            );

            // ✅ Clear cart
            await axios.delete(`${API_BASE_URL}/api/user/cart`, {
              withCredentials: true,
            });
            updateCartContext([]);
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: selectedAddress.name,
          email: "customer@example.com", // you can take from logged in user
          contact: selectedAddress.phone,
        },
        modal: {
          ondismiss: function () {
            navigate("/cart"); // using react-router navigate
          },
        },

        theme: { color: "#1976D2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Failed to initialize payment:", err);
      toast.error("Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  // 🛒 Handle COD Order
  const handleCODOrder = async () => {
    if (!selectedAddress) return toast.error("Select a shipping address");
    if (cartItems.length === 0) return toast.error("Cart is empty");

    try {
      setLoading(true);

      // 1️⃣ Place COD order
      await axios.post(
        `${API_BASE_URL}/api/order/place`,
        {
          products: cartItems.map((item) => ({
            product: item.product._id,
            variantId: item.variant._id,
            quantity: item.quantity,
          })),
          shippingAddress: selectedAddress,
          totalAmount,
          paymentType: "COD",
        },
        { withCredentials: true }
      );

      // 2️⃣ Clear cart on backend
      await axios.delete(`${API_BASE_URL}/api/user/cart`, {
        withCredentials: true,
      });

      // 3️⃣ Clear cart in Context
      updateCartContext([]);

      navigate("/success");
    } catch (err) {
      toast.error("Failed to place COD order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />

      <h2 className="mb-4 text-primary">Payment</h2>

      {/* Shipping Address */}
      {selectedAddress ? (
        <div className="card shadow-sm p-3 mb-4">
          <h5>Shipping Address</h5>
          <p>
            <strong>{selectedAddress.name}</strong>
            <br />
            {selectedAddress.street}, {selectedAddress.city},{" "}
            {selectedAddress.state}, {selectedAddress.country} -{" "}
            {selectedAddress.pincode}
            <br />
            Phone: {selectedAddress.phone}
          </p>
        </div>
      ) : (
        <p className="text-danger mb-3">No shipping address selected</p>
      )}

      {/* Product Summary */}
      <div className="card shadow-sm p-3 mb-4">
        <PaymentTimer onExpire={() => navigate("/cart")} />

        <h5>Order Summary</h5>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item._id}
              className="d-flex justify-content-between align-items-center py-2 border-bottom"
            >
              <div className="d-flex align-items-center">
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      marginRight: 10,
                    }}
                  />
                )}
                <span>
                  {item.product.name} x {item.quantity}
                </span>
              </div>
              <span>
                ₹{(item.variant.finalPrice * item.quantity).toLocaleString()}
              </span>
            </div>
          ))
        )}
        <div className="d-flex justify-content-between mt-2">
          <span>Shipping</span>
          <span>₹{shipping.toLocaleString()}</span>
        </div>
        <div className="d-flex justify-content-between mt-2 fw-bold">
          <span>Total</span>
          <span>₹{payableAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-3">
        <label className="form-label">Select Payment Method</label>
        <select
          className="form-select"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <option value="Online">Online (Razorpay)</option>
          <option value="COD">Cash on Delivery</option>
        </select>
      </div>

      {paymentType === "Online" ? (
        <button
          className="btn btn-success w-100"
          onClick={handleRazorpayPayment}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      ) : (
        <button
          className="btn btn-secondary w-100"
          onClick={handleCODOrder}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? "Placing Order..." : "Place COD Order"}
        </button>
      )}
    </div>
  );
}
