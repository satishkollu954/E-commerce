import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { motion } from "framer-motion"; // 👈 Import motion

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
    <motion.div
      className="text-center my-5"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }} // 👈 Trigger when in viewport
      viewport={{ once: true, amount: 0.3 }} // 👈 Run once, when 30% is visible
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Title */}
      <motion.h2
        className="fw-bold mb-5"
        style={{ fontFamily: "cursive", fontSize: "2.5rem" }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Our Order History
      </motion.h2>

      {/* Stats Row */}
      <Row className="justify-content-center g-5">
        {/* Happy Customers */}
        <Col md={3} sm={6}>
          <motion.div
            className="d-flex flex-column align-items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
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
          </motion.div>
        </Col>

        {/* Orders */}
        <Col md={3} sm={6}>
          <motion.div
            className="d-flex flex-column align-items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
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
          </motion.div>
        </Col>

        {/* Products Delivered */}
        <Col md={3} sm={6}>
          <motion.div
            className="d-flex flex-column align-items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
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
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
}
