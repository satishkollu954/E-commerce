import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export function FitFusionUserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/orders`, {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch user orders", err);
      toast.error("Failed to fetch your orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading your orders...</p>;

  if (orders.length === 0) return <p>You don’t have any orders yet.</p>;

  return (
    <div className="container py-4">
      <h3>My Orders</h3>
      {orders.map((order) => (
        <div key={order._id} className="card mb-3">
          <div className="card-header d-flex justify-content-between">
            <span>Order ID: {order._id}</span>
            <span>Status: {order.status}</span>
          </div>

          <div className="card-body">
            <p>
              <b>Total:</b> ₹{order.totalAmount}
            </p>
            <p>
              <b>Payment:</b> {order.paymentType} ({order.paymentStatus})
            </p>

            <h6>Products:</h6>
            <ul>
              {order.products.map((p, idx) => (
                <li key={idx}>
                  {p.product?.name} - {p.quantity}
                </li>
              ))}
            </ul>

            <h6>Shipping Address:</h6>
            <p>
              {order.shippingAddress.name} <br />
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}, {order.shippingAddress.country} -{" "}
              {order.shippingAddress.postalCode} <br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
