import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionViewAllOrders() {
  const [orders, setOrders] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/order/`, {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  // Admin manually updates order.status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/order/${orderId}`,
        { orderStatus: newStatus },
        { withCredentials: true }
      );
      fetchOrders();
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Approve return request
  const approveReturn = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/approve`,
        { orderId },
        { withCredentials: true }
      );
      fetchOrders();
      toast.success("Return approved");
    } catch (err) {
      toast.error("Failed to approve return");
    }
  };

  // Collect + Refund
  const collectAndRefund = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/collect-refund`,
        { orderId },
        { withCredentials: true }
      );
      fetchOrders();
      toast.success("Refund completed");
    } catch (err) {
      toast.error("Failed to refund");
    }
  };

  // Open confirm modal
  const confirmDeleteOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  // Delete order
  const deleteOrder = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/order/${selectedOrderId}`, {
        withCredentials: true,
      });

      toast.success("Order deleted successfully");
      setShowConfirmModal(false);
      setSelectedOrderId(null);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to delete order");
    }
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
                  {p.name} - {p.quantity}
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
              {/* Status dropdown */}
              <select
                className="form-select form-select-sm"
                style={{ width: "170px" }}
                value={order.status}
                disabled={
                  order.status === "Processing" ||
                  order.status === "Shipped" ||
                  order.status === "Delivered"
                }
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
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

              {/* Collect & refund */}
              {order.returnRequest?.requested &&
                order.returnRequest.status === "Approved" && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => collectAndRefund(order._id)}
                  >
                    Collect & Refund
                  </button>
                )}

              {/* Delete Button */}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => confirmDeleteOrder(order._id)}
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this order?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={deleteOrder}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
