import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionViewAllOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/order/${orderId}`,
        { orderStatus: newStatus },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const approveReturn = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/approve`,
        { orderId },
        { withCredentials: true }
      );
      toast.success("Return approved");
      fetchOrders();
    } catch {
      toast.error("Failed to approve return");
    }
  };

  const collectReturn = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/collect-refund`,
        { orderId },
        { withCredentials: true }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status: "Returned",
                returnRequest: { ...o.returnRequest, status: "Returned" },
              }
            : o
        )
      );

      toast.success("Return collected & refund processed");
    } catch {
      toast.error("Failed to process return");
    }
  };

  const rejectReturn = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/reject`,
        { orderId },
        { withCredentials: true }
      );
      toast.success("Return rejected");
      fetchOrders();
    } catch (err) {
      console.error("Failed to reject return:", err);
      toast.error("Failed to reject return");
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "Placed":
        return ["Processing", "Shipped", "Delivered"];
      case "Processing":
        return ["Shipped", "Delivered"];
      case "Shipped":
        return ["Delivered"];
      default:
        return [];
    }
  };

  const confirmDeleteOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  const deleteOrder = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/order/${selectedOrderId}`, {
        withCredentials: true,
      });
      toast.success("Order deleted successfully");
      setShowConfirmModal(false);
      setSelectedOrderId(null);
      fetchOrders();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  return (
    <div className="container py-4">
      <h3>All Orders</h3>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>User ID</th>
              <th>User Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr>
                  <td>{order._id}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "140px" }}
                      disabled={
                        order.status === "Delivered" ||
                        order.status === "Cancelled" ||
                        order.status === "Returned"
                      }
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      value={order.status}
                    >
                      <option value={order.status} disabled>
                        {order.status}
                      </option>
                      {getAvailableStatuses(order.status).map((status, idx) => (
                        <option
                          key={status}
                          value={status}
                          disabled={idx !== 0}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {/* Status dropdown always visible */}
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "140px" }}
                      disabled={
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                      }
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      value={order.status}
                    >
                      <option value={order.status} disabled>
                        {order.status}
                      </option>
                      {getAvailableStatuses(order.status).map((status, idx) => (
                        <option
                          key={status}
                          value={status}
                          disabled={idx !== 0}
                        >
                          {status}
                        </option>
                      ))}
                    </select>

                    {/* Highlight return requests */}
                    {order.returnRequest?.requested && (
                      <span
                        style={{
                          backgroundColor:
                            order.returnRequest.status === "Approved"
                              ? "orange"
                              : order.returnRequest.status === "Returned"
                              ? "green"
                              : order.returnRequest.status === "Rejected"
                              ? "red"
                              : "gray",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                        }}
                      >
                        {order.returnRequest.status === "Approved" &&
                          "Return Approved"}
                        {order.returnRequest.status === "Returned" &&
                          "Refund Successfully"}
                        {order.returnRequest.status === "Rejected" &&
                          "Return Rejected"}
                        {order.returnRequest.status === "Pending" &&
                          "Return Requested"}
                      </span>
                    )}
                  </td>

                  <td>{order.user._id}</td>
                  <td>{order.user.name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order._id ? null : order._id
                        )
                      }
                    >
                      {expandedOrderId === order._id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Order Details */}
                {expandedOrderId === order._id && (
                  <tr>
                    <td colSpan={5}>
                      <div className="card p-3">
                        <p>
                          <b>Payment:</b> {order.paymentType} (
                          {order.paymentStatus})
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
                          {order.shippingAddress.address},{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state},{" "}
                          {order.shippingAddress.country} -{" "}
                          {order.shippingAddress.postalCode}
                          <br />
                          Phone: {order.shippingAddress.phone}
                        </p>

                        {/* Return Request Section */}
                        {/* Return Request Section */}
                        {order.returnRequest?.requested && (
                          <div className="mt-3">
                            <p>
                              <b>Return Reason:</b> {order.returnRequest.reason}
                            </p>

                            {/* Pending return: Approve or Reject */}
                            {order.returnRequest.status === "Pending" && (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => approveReturn(order._id)}
                                >
                                  Approve Return
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => rejectReturn(order._id)}
                                >
                                  Reject Return
                                </button>
                              </div>
                            )}

                            {/* Approved return but not collected yet */}
                            {order.returnRequest.status === "Approved" &&
                              order.status !== "Returned" && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => collectReturn(order._id)}
                                >
                                  Collect Return & Refund
                                </button>
                              )}

                            {/* Rejected return */}
                            {order.returnRequest.status === "Rejected" && (
                              <span className="text-danger">
                                Return Rejected
                              </span>
                            )}

                            {/* Completed return */}
                            {order.returnRequest.status === "Returned" && (
                              <span className="text-success">
                                Returned & Refunded
                              </span>
                            )}
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          className="btn btn-sm btn-outline-danger mt-3"
                          onClick={() => confirmDeleteOrder(order._id)}
                        >
                          Delete Order
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

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
