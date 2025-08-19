import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaShoppingCart, FaBoxOpen } from "react-icons/fa";

export function FitFusionOrderStats() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchUsers = () =>
    axios
      .get(`${API_BASE_URL}/api/admin/users`)
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch users", err));

  const fetchProducts = () =>
    axios
      .get(`${API_BASE_URL}/api/product`)
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch products", err));

  const fetchOrders = () =>
    axios
      .get(`${API_BASE_URL}/api/user/orderscount`, {
        withCredentials: true,
      })
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch orders", err));

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, []);

  return (
    <div className="text-center my-5">
      {/* Title */}
      <h2
        className="fw-bold mb-5"
        style={{ fontFamily: "cursive", fontSize: "2.5rem" }}
      >
        Our Order History
      </h2>

      {/* Stats Row */}
      <Row className="justify-content-center g-5">
        {/* Happy Customers */}
        <Col md={3} sm={6}>
          <div className="d-flex flex-column align-items-center">
            <div
              className="rounded-2 d-flex justify-content-center align-items-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaUsers size={60} />
            </div>
            <h3 className="fw-bold mt-3">{users.length.toLocaleString()}+</h3>
            <p className="fw-semibold" style={{ fontFamily: "cursive" }}>
              Happy Customers
            </p>
          </div>
        </Col>

        {/* Orders */}
        <Col md={3} sm={6}>
          <div className="d-flex flex-column align-items-center">
            <div
              className="rounded-2 d-flex justify-content-center align-items-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaShoppingCart size={60} />
            </div>
            <h3 className="fw-bold mt-3">{orders.length.toLocaleString()}+</h3>
            <p className="fw-semibold" style={{ fontFamily: "cursive" }}>
              Orders
            </p>
          </div>
        </Col>

        {/* Products Delivered */}
        <Col md={3} sm={6}>
          <div className="d-flex flex-column align-items-center">
            <div
              className="rounded-2 d-flex justify-content-center align-items-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaBoxOpen size={60} />
            </div>
            <h3 className="fw-bold mt-3">
              {products.length.toLocaleString()}+
            </h3>
            <p className="fw-semibold" style={{ fontFamily: "cursive" }}>
              Products Delivered
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
}
