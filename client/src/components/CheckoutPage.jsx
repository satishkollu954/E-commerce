import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

export function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const SHIPPING_COST = 50;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.variant.finalPrice * item.quantity,
    0
  );
  const totalAmount = subtotal + SHIPPING_COST;

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/cart`, {
        withCredentials: true,
      });
      setCartItems(res.data.cart);
    } catch {
      toast.error("Failed to fetch cart");
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        withCredentials: true,
      });
      setAddresses(res.data.addresses || []);
      if (res.data.addresses?.length > 0)
        setSelectedAddressId(res.data.addresses[0]._id);
    } catch {
      toast.error("Failed to fetch addresses");
    }
  };

  const handleAddressChange = (e) =>
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const validateAddress = () => {
    for (let key in newAddress) {
      if (!newAddress[key]) {
        toast.error(`Please enter ${key}`);
        return false;
      }
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    return true;
  };

  const addOrUpdateAddress = async () => {
    if (!validateAddress()) return;
    try {
      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/user/address/${selectedAddressId}`,
          newAddress,
          { withCredentials: true }
        );
        toast.success("Address updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/api/user/address`, newAddress, {
          withCredentials: true,
        });
        toast.success("Address added successfully");
      }
      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        phone: "",
      });
      setIsEditing(false);
      setShowModal(false);
      fetchAddresses();
    } catch {
      toast.error("Failed to save address");
    }
  };

  const editAddress = (addr) => {
    setNewAddress({ ...addr });
    setSelectedAddressId(addr._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const goToPayment = () => {
    const selectedAddress = addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (!selectedAddress) {
      toast.error("Select or add an address");
      return;
    }
    navigate("/payment", {
      state: {
        cartItems,
        selectedAddress,
        totalAmount,
        shipping: SHIPPING_COST,
      },
    });
  };

  return (
    <div className="container py-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 className="mb-4 text-primary">Checkout</h2>

      {/* Cart Summary */}
      <div className="card mb-4 shadow-sm border-0 rounded-4">
        <div className="card-header bg-primary text-white rounded-top-4">
          <strong>Order Summary</strong>
        </div>
        <div className="card-body">
          {cartItems.length === 0 ? (
            <p className="text-muted">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="d-flex align-items-center justify-content-between py-3 border-bottom hover-shadow"
                style={{ transition: "all 0.2s" }}
              >
                <div>
                  <h6 className="mb-1">{item.product.name}</h6>
                  <small className="text-muted">
                    ₹{item.variant.finalPrice.toLocaleString()} ×{" "}
                    {item.quantity}
                  </small>
                </div>
                <div className="fw-bold">
                  ₹{(item.variant.finalPrice * item.quantity).toLocaleString()}
                </div>
              </div>
            ))
          )}

          <div className="d-flex justify-content-between mt-3">
            <span>Subtotal</span>
            <span className="fw-semibold">₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="d-flex justify-content-between mt-2">
            <span>Shipping</span>
            <span className="fw-semibold">
              ₹{SHIPPING_COST.toLocaleString()}
            </span>
          </div>

          <div className="d-flex justify-content-between mt-3 pt-3 border-top fw-bold fs-5">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="mb-4">
        <h5>Shipping Address</h5>
        {addresses.length === 0 && <p>No addresses found. Please add one.</p>}
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`card mb-2 p-3 shadow-sm ${
              selectedAddressId === addr._id ? "border border-primary" : ""
            }`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <input
                  type="radio"
                  className="me-2"
                  checked={selectedAddressId === addr._id}
                  onChange={() => setSelectedAddressId(addr._id)}
                />
                <strong>{addr.name}</strong>, {addr.street}, {addr.city},{" "}
                {addr.state}, {addr.country} - {addr.pincode} | {addr.phone}
              </div>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => editAddress(addr)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}

        <Button
          className="mt-2"
          variant="outline-primary"
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
          }}
        >
          Add New Address
        </Button>
      </div>

      {/* Address Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Address" : "Add New Address"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {[
            "name",
            "street",
            "city",
            "state",
            "pincode",
            "country",
            "phone",
          ].map((field) => (
            <div className="mb-2" key={field}>
              <input
                type="text"
                className="form-control"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={newAddress[field]}
                onChange={handleAddressChange}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addOrUpdateAddress}>
            {isEditing ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Button
        className="btn-success btn-lg w-100"
        onClick={goToPayment}
        disabled={!selectedAddressId}
      >
        Proceed to Payment
      </Button>
    </div>
  );
}
