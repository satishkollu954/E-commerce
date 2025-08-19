import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Tabs, Tab, Container } from "react-bootstrap";
import axios from "axios";
import { FitFusionViewAllSellers } from "./FitFusionViewAllSellers";
import { FitFusionViewAllUsers } from "./FitFusionViewAllUsers";
import { FitFusionViewAllOrders } from "./FitFusionViewAllOrders";
import { FitFusionViewProductsBySeller } from "./FitFusionViewProductsBySeller";
import { FitFusionViewQueries } from "./FitFusionViewQueires";
import { FitFusionAddAdvertisement } from "./FItFusionAddAdvertisement";
import { FitFusionAddFAQs } from "./FitFusionAddFAQs";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function FitFusionAdminDashboard() {
  const [activeTab, setActiveTab] = useState("sellers");
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [queries, setQueires] = useState([]);
  const [advertisement, setAdvertisement] = useState([]);
  const [addFAQs, setaddFAQs] = useState([]);

  const fetchSellers = () =>
    axios
      .get(`${API_BASE_URL}/api/seller/getallsellers`)
      .then((res) => setSellers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch sellers", err));

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
      .get(`${API_BASE_URL}/api/order`, {
        withCredentials: true,
      })
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
        console.log("Fetched orders:", res.data);
      })
      .catch((err) => console.error("Failed to fetch orders", err));

  // Fetch all on mount
  useEffect(() => {
    fetchSellers();
    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, []);

  return (
    <Container className="py-4">
      <h3 className="text-center mb-4">Admin Dashboard</h3>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        {/* Sellers Count */}
        <div
          className="d-flex align-items-center shadow-sm rounded-4 p-3 bg-white"
          style={{ width: "320px" }}
        >
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="bi bi-shop fs-3"></i>
          </div>
          <div className="ms-3 text-start">
            <h6 className="fw-bold text-dark mb-1">Sellers</h6>
            <p className="mb-0 text-success fw-bold">
              {sellers.filter((s) => s.isApproved).length} Approved
            </p>
            <p className="mb-0 text-danger">
              {sellers.filter((s) => !s.isApproved).length} Unauthorized
            </p>
          </div>
        </div>

        {/* Users Count */}
        <div
          className="d-flex align-items-center shadow-sm rounded-4 p-3 bg-white"
          style={{ width: "320px" }}
        >
          <div
            className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="bi bi-people fs-3"></i>
          </div>
          <div className="ms-3 text-start">
            <h6 className="fw-bold text-dark mb-1">Users</h6>
            <p className="mb-0 text-success fw-bold">{users.length} Total</p>
          </div>
        </div>

        {/* Orders Count */}
        <div
          className="d-flex align-items-center shadow-sm rounded-4 p-3 bg-white"
          style={{ width: "320px" }}
        >
          <div
            className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="bi bi-bag-check fs-3"></i>
          </div>
          <div className="ms-3 text-start">
            <h6 className="fw-bold text-dark mb-1">Orders</h6>
            {orders.length > 0 ? (
              <>
                <p className="mb-0 text-primary">
                  Placed: {orders.filter((o) => o.status === "Placed").length}
                </p>
                <p className="mb-0 text-success">
                  Delivered:{" "}
                  {orders.filter((o) => o.status === "Delivered").length}
                </p>
                <p className="mb-0 text-danger">
                  Cancelled:{" "}
                  {orders.filter((o) => o.status === "Cancelled").length}
                </p>
              </>
            ) : (
              <p className="text-muted mb-0">No orders yet</p>
            )}
          </div>
        </div>

        {/* Return Requests */}
        <div
          className="d-flex align-items-center shadow-sm rounded-4 p-3 bg-white"
          style={{ width: "320px" }}
        >
          <div
            className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="bi bi-arrow-repeat fs-3"></i>
          </div>
          <div className="ms-3 text-start">
            <h6 className="fw-bold text-dark mb-1">Return Requests</h6>
            {orders.length > 0 ? (
              <>
                <p className="mb-0 text-dark">
                  Total:{" "}
                  {orders.filter((o) => o.returnRequest?.requested).length}
                </p>
                <p className="mb-0 text-warning">
                  Approved:{" "}
                  {
                    orders.filter((o) => o.returnRequest?.status === "Approved")
                      .length
                  }
                </p>
                <p className="mb-0 text-danger">
                  Rejected:{" "}
                  {
                    orders.filter((o) => o.returnRequest?.status === "Rejected")
                      .length
                  }
                </p>
              </>
            ) : (
              <p className="text-muted mb-0">No requests yet</p>
            )}
          </div>
        </div>

        {/* Products Count */}
        <div
          className="d-flex align-items-center shadow-sm rounded-4 p-3 bg-white"
          style={{ width: "320px" }}
        >
          <div
            className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="bi bi-box-seam fs-3"></i>
          </div>
          <div className="ms-3 text-start">
            <h6 className="fw-bold text-dark mb-1">Products</h6>
            <p className="mb-0 text-primary">
              Men:{" "}
              {
                products.filter(
                  (p) => p.category?.toLowerCase() === "men" && p.isApproved
                ).length
              }
            </p>
            <p className="mb-0 text-pink">
              Women:{" "}
              {
                products.filter(
                  (p) => p.category?.toLowerCase() === "women" && p.isApproved
                ).length
              }
            </p>
            <p className="mb-0 text-warning">
              Kids:{" "}
              {
                products.filter(
                  (p) => p.category?.toLowerCase() === "child" && p.isApproved
                ).length
              }
            </p>
            <p className="mb-0 text-danger">
              Unauthorized: {products.filter((p) => !p.isApproved).length}
            </p>
          </div>
        </div>
      </div>

      <br />

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="sellers" title="Sellers">
          <FitFusionViewAllSellers sellers={sellers} refresh={fetchSellers} />
        </Tab>
        <Tab eventKey="users" title="Users">
          <FitFusionViewAllUsers users={users} refresh={fetchUsers} />
        </Tab>
        <Tab eventKey="orders" title="Orders">
          <FitFusionViewAllOrders orders={orders} refresh={fetchOrders} />
        </Tab>
        <Tab eventKey="products" title="Products by seller">
          <FitFusionViewProductsBySeller
            products={products}
            refresh={fetchProducts}
          />
        </Tab>
        <Tab eventKey="queries" title="Queries">
          <FitFusionViewQueries queries={queries} refresh={fetchOrders} />
        </Tab>
        <Tab eventKey="advertisement" title="Add advertisement">
          <FitFusionAddAdvertisement
            advertisement={advertisement}
            refresh={fetchOrders}
          />
        </Tab>
        <Tab eventKey="addFAQs" title="Add FAQs">
          <FitFusionAddFAQs addFAQs={addFAQs} refresh={fetchOrders} />
        </Tab>
      </Tabs>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Container>
  );
}

{
  /* <Tabs defaultActiveKey="men" className="my-3">
            <Tab eventKey="men" title="Men">
              {renderTable(
                filterProducts("men"),
                "products",
                productPage,
                setProductPage
              )}
            </Tab>
            <Tab eventKey="women" title="Women">
              {renderTable(
                filterProducts("women"),
                "products",
                productPage,
                setProductPage
              )}
            </Tab>
            <Tab eventKey="kids" title="Kids">
              {renderTable(
                filterProducts("child"),
                "products",
                productPage,
                setProductPage
              )}
            </Tab>
          </Tabs> */
}
