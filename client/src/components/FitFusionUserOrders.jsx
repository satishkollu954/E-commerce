import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import "./FitFusionUserOrders.css";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";

export function FitFusionUserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [isResponseLoading, setIsReponseLoading] = useState();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getRemainingDays = (deliveredAt) => {
    if (!deliveredAt) return null;

    const deliveryDate = moment(deliveredAt).startOf("day");
    const today = moment().startOf("day");

    const daysDiff = deliveryDate.diff(today, "days");

    if (daysDiff > 0) {
      return `${daysDiff} day(s) remaining`;
    } else if (daysDiff === 0) {
      return "Delivering today";
    } else {
      return "Delivered";
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/orders`, {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch {
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
    setIsReponseLoading(true);
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
    } finally {
      setIsReponseLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-4">Loading your orders...</p>;
  if (orders.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column min-vh-100">
        <p className="text-center mb-3">You don’t have any orders yet.</p>
        <Link to="/" className="btn w-25 bg-dark text-white">
          Shop now
        </Link>
      </div>
    );
  }

  const getReturnStatusBadge = (status) => {
    switch (status) {
      case "Returned":
        return <span className="badge bg-success mb-2">Return Completed</span>;
      case "Rejected":
        return <span className="badge bg-danger mb-0">Return Rejected</span>;
      case "Approved":
        return (
          <span className="badge bg-warning text-dark mb-2">
            Return Approved
          </span>
        );
      case "Processing":
        return <span className="badge bg-primary">Return Processing</span>;
      case "Pending":
        return <span className="badge bg-info text-dark">Return Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer />
      <h3 className="mb-4 fw-bold text-primary">My Orders</h3>

      <div className="row">
        {orders.map((order) => {
          const delivered = order.status === "Delivered";
          const deliveryDate = order.deliveredAt
            ? moment(order.deliveredAt)
            : null;
          const daysSinceDelivery = deliveryDate
            ? moment().diff(deliveryDate, "days")
            : 0;

          const canReturn = delivered && daysSinceDelivery <= 7;
          const returnRequested = order.returnRequest?.requested;
          const returnStatus = order.returnRequest?.status;

          return (
            <div key={order._id} className="col-md-4 col-sm-6 col-12 mb-4">
              <div className="card h-100 border-0 shadow-sm rounded-3">
                {/* Header */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <span>
                    <strong>Order ID:</strong> {order._id}
                  </span>

                  {order.returnRequest?.requested ? (
                    getReturnStatusBadge(order.returnRequest.status)
                  ) : order.status === "Cancelled" ? (
                    <span className="badge bg-danger">Cancelled</span>
                  ) : order.status === "Delivered" ? (
                    <span className="badge bg-success">Delivered</span>
                  ) : order.status === "Shipped" ? (
                    <span className="badge bg-primary">Shipped</span>
                  ) : order.status === "Processing" ? (
                    <span className="badge bg-warning text-dark">
                      Processing
                    </span>
                  ) : order.status === "Placed" ? (
                    <span className="badge bg-info text-dark">
                      Order Placed
                    </span>
                  ) : (
                    <span className="badge bg-secondary">{order.status}</span>
                  )}
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
                          {p.variant.size || p.variant.childAgeGroup}
                        </small>
                      </div>
                      <div>₹{p.price * p.quantity}</div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      <div>
                        <strong>Total: </strong>₹{order.totalAmount}
                      </div>
                      <div>
                        <strong>Payment: </strong>
                        {order.paymentType}
                      </div>
                      <div>
                        <strong>Delivery time: </strong>
                        {getRemainingDays(order.deliveredAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2 align-items-center">
                      {!delivered &&
                        order.status !== "Shipped" &&
                        order.status !== "Cancelled" &&
                        !["Returned", "Rejected", "Approved"].includes(
                          returnStatus
                        ) && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancel(order._id)}
                          >
                            Cancel
                          </button>
                        )}

                      {delivered && (
                        <button className="btn btn-primary btn-sm">
                          Review
                        </button>
                      )}

                      {canReturn && !returnRequested && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => openReturnModal(order._id)}
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Reason Modal */}
      {showReturnModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-warning">
                  Return Reason
                </h5>
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
                  className="btn btn-warning d-flex align-items-center justify-content-center"
                  onClick={submitReturnRequest}
                  disabled={isResponseLoading} // disable while loading
                >
                  {isResponseLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Return"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
