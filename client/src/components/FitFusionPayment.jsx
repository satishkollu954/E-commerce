// src/components/Payment.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

export function FitFusionPayment() {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("Online");
  const location = useLocation();

  const {
    cartItems = [],
    selectedAddress,
    totalAmount = 0,
    shipping = 0,
  } = location.state || {};

  const handleRazorpayPayment = async () => {
    if (!selectedAddress) return toast.error("Select a shipping address");

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3005/api/payment/create-order",
        { products: cartItems },
        { withCredentials: true }
      );

      const { id: razorpay_order_id, verifiedAmount } = res.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: verifiedAmount * 100,
        currency: "INR",
        name: "YourStore",
        description: "Purchase from YourStore",
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            await axios.post(
              "http://localhost:3005/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                products: cartItems.map((item) => ({
                  product: item.product._id,
                  quantity: item.quantity,
                })),
                shippingAddress: selectedAddress,
                paymentType: "Online",
              },
              { withCredentials: true }
            );

            toast.success("Payment successful! Order placed.");
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: selectedAddress.name,
          email: "", // optional
          contact: selectedAddress.phone,
        },
        theme: { color: "#1976D2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCODOrder = async () => {
    if (!selectedAddress) return toast.error("Select a shipping address");

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3005/api/payment/cod-order",
        {
          cart: cartItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          shippingAddress: selectedAddress,
        },
        { withCredentials: true }
      );
      toast.success("COD order placed successfully!");
    } catch (err) {
      toast.error("Failed to place COD order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

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
          <span>₹{totalAmount.toLocaleString()}</span>
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
