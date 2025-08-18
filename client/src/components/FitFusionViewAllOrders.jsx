import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionViewAllOrders() {
  const [orders, setOrders] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/order/`, {
      withCredentials: true,
    });
    setOrders(res.data);
  };

  const markDelivered = async (orderId) => {
    await axios.post(
      `${API_BASE_URL}/api/order/mark-delivered`,
      { orderId },
      { withCredentials: true }
    );
    fetchOrders();
  };

  // Admin manually updates order.status
  const updateOrderStatus = async (orderId, newStatus) => {
    await axios.put(
      `${API_BASE_URL}/api/admin/order/${orderId}`,
      { orderStatus: newStatus },
      { withCredentials: true }
    );
    fetchOrders();
  };

  // Approve return request
  const approveReturn = async (orderId) => {
    await axios.post(
      `${API_BASE_URL}/api/order/return/approve`,
      { orderId },
      { withCredentials: true }
    );
    fetchOrders();
  };

  // Collect + Refund
  const collectAndRefund = async (orderId) => {
    await axios.post(
      `${API_BASE_URL}/api/order/return/collect-refund`,
      { orderId },
      { withCredentials: true }
    );
    fetchOrders();
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    await axios.delete(`${API_BASE_URL}/api/admin/order/${orderId}`, {
      withCredentials: true,
    });

    toast.success("Order deleted successfully");
    fetchOrders();
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h3>All Orders</h3>

      {orders.map((order) => (
        <div key={order._id} className="card mb-3">
          <div className="card-header d-flex justify-content-between">
            <span>Order ID: {order._id}</span>
            <span>User: {order.user.name}</span>
          </div>

          <div className="card-body">
            <p>
              <b>Status:</b> {order.status}
            </p>
            <p>
              <b>Payment:</b> {order.paymentType} ({order.paymentStatus})
            </p>
            <p>
              <b>Total:</b> ₹{order.totalAmount}
            </p>

            <h6>Products:</h6>
            <ul>
              {order.products.map((p, idx) => (
                <li key={idx}>
                  {" "}
                  {p.name} - {p.quantity}{" "}
                </li>
              ))}
            </ul>

            <h6>Shipping Address:</h6>
            <p>
              {order.shippingAddress.name}
              <br />
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state},{order.shippingAddress.country} -{" "}
              {order.shippingAddress.postalCode}
              <br />
              Phone: {order.shippingAddress.phone}
            </p>

            {/* ACTION BUTTONS */}
            <div className="d-flex flex-wrap gap-2 mt-2">
              {order.status !== "Delivered" && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => markDelivered(order._id)}
                >
                  Mark Delivered
                </button>
              )}

              {/* status dropdown example */}
              <select
                className="form-select form-select-sm"
                style={{ width: "170px" }}
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              >
                <option value="Placed">Placed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Return Approve */}
              {order.returnRequest?.requested &&
                order.returnRequest.status === "Pending" && (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => approveReturn(order._id)}
                  >
                    Approve Return
                  </button>
                )}

              {/* Collect & refund (only after approved) */}
              {order.returnRequest?.requested &&
                order.returnRequest.status === "Approved" && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => collectAndRefund(order._id)}
                  >
                    Collect & Refund
                  </button>
                )}

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteOrder(order._id)}
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
