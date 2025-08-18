import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";

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

  const handleReturn = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/order/return/initiate`,
        { orderId, reason: "Return requested" },
        { withCredentials: true }
      );
      toast.success("Return request submitted");
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

        // Return allowed only within 7 days
        const daysSinceDelivery = deliveryDate
          ? moment().diff(deliveryDate, "days")
          : 0;
        const canReturn = delivered && daysSinceDelivery <= 7;

        // Review allowed anytime after delivery
        const canReview = delivered;

        // Remaining days for return
        const remainingReturnDays = canReturn ? 7 - daysSinceDelivery : 0;

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
                  {/* PRODUCT IMAGE */}
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

              <div className="mt-3 d-flex justify-content-between align-items-center">
                <div>
                  <strong>Total:</strong> ₹{order.totalAmount}
                </div>

                {/* ACTION BUTTONS */}
                {order.status === "Cancelled" ? null : !delivered ? (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleCancel(order._id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <div className="d-flex gap-2 align-items-center">
                    {/* Write Review always after delivery */}
                    {canReview && (
                      <button className="btn btn-primary btn-sm">
                        Write Review
                      </button>
                    )}

                    {/* Return only within 7 days */}
                    {canReturn && (
                      <>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleReturn(order._id)}
                        >
                          Return
                        </button>
                        <small className="text-muted">
                          ({remainingReturnDays} day
                          {remainingReturnDays > 1 ? "s" : ""} left)
                        </small>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
