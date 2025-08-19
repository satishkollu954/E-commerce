import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";

export function FitFusionUserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
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
      toast.error("Failed to fetch your orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/cancel`,
        { orderId },
        { withCredentials: true }
      );
      toast.success("Order cancelled");
      fetchUserOrders();
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const openReturnModal = (orderId) => {
    setSelectedOrderId(orderId);
    setReturnReason("");
    setShowReturnModal(true);
  };

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error("Please enter a reason for return");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/initiate`,
        { orderId: selectedOrderId, reason: returnReason },
        { withCredentials: true }
      );
      toast.success("Return request submitted");
      setShowReturnModal(false);
      fetchUserOrders();
    } catch {
      toast.error("Failed to initiate return");
    }
  };

  if (loading) return <p>Loading your orders...</p>;
  if (orders.length === 0) return <p>You don’t have any orders yet.</p>;

  return (
    <div className="container py-4">
      <ToastContainer />
      <h3 className="mb-4">My Orders</h3>

      {orders.map((order) => {
        const delivered = order.status === "Delivered";
        const deliveryDate = order.deliveredAt
          ? moment(order.deliveredAt)
          : null;
        const daysSinceDelivery = deliveryDate
          ? moment().diff(deliveryDate, "days")
          : 0;

        const canReturn = delivered && daysSinceDelivery <= 7;
        const remainingReturnDays = canReturn ? 7 - daysSinceDelivery : 0;
        const canReview = delivered;
        const returnRequested = order.returnRequest?.requested;
        const returnStatus = order.returnRequest?.status;

        return (
          <div key={order._id} className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between">
              <span>Order ID: {order._id}</span>
              <span>Status: {order.status}</span>
            </div>

            <div className="card-body">
              {order.products.map((p, idx) => (
                <div
                  key={idx}
                  className="d-flex align-items-center mb-3 border-bottom pb-2"
                >
                  <img
                    src={`${API_BASE_URL}${p.images[0]}`}
                    alt={p.name}
                    style={{
                      width: 70,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginRight: 12,
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{p.name}</h6>
                    <small className="text-muted">
                      Qty: {p.quantity} |{" "}
                      {p.variant?.size || p.variant?.childAgeGroup || "N/A"}
                    </small>
                  </div>
                  <div>₹{p.price * p.quantity}</div>
                </div>
              ))}

              <div className="mt-3 d-flex justify-content-between align-items-center">
                <div>
                  <strong>Total:</strong> ₹{order.totalAmount} <br />
                  <strong>Payment:</strong> {order.paymentType} (
                  {order.paymentStatus})
                </div>

                <div className="d-flex gap-2 align-items-center">
                  {/* Cancel button only if order not delivered, not cancelled, and return not approved */}
                  {!delivered &&
                    order.status !== "Cancelled" &&
                    returnStatus !== "Approved" && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancel(order._id)}
                      >
                        Cancel
                      </button>
                    )}

                  {/* Write review after delivery */}
                  {canReview && (
                    <button className="btn btn-primary btn-sm">
                      Write Review
                    </button>
                  )}

                  {/* Return button only if return not requested */}
                  {canReturn && !returnRequested && (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => openReturnModal(order._id)}
                    >
                      Return
                    </button>
                  )}

                  {/* Show return status if requested */}
                  {returnRequested && (
                    <span className="text-success">
                      Return Requested ({returnStatus})
                    </span>
                  )}

                  {/* Show remaining days for return */}
                  {canReturn && remainingReturnDays > 0 && !returnRequested && (
                    <small className="text-muted">
                      ({remainingReturnDays} day
                      {remainingReturnDays > 1 ? "s" : ""} left)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Return Reason Modal */}
      {showReturnModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Return Reason</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReturnModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="4"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Enter reason for return..."
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  onClick={submitReturnRequest}
                >
                  Submit Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
