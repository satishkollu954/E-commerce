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
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
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

      <div className="row g-4 text-center">
        {/* Sellers Count */}
        <div className="col-md-3">
          <div className="card shadow-lg border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex flex-column align-items-center">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-shop fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark">Sellers</h5>
              <p className="fs-4 fw-bold text-success mb-1">
                {sellers.filter((s) => s.isApproved).length}
              </p>
              <h6 className="text-muted">Unauthorized</h6>
              <p className="fs-5 fw-semibold text-danger mb-0">
                {sellers.filter((s) => !s.isApproved).length}
              </p>
            </div>
          </div>
        </div>

        {/* Users Count */}
        <div className="col-md-3">
          <div className="card shadow-lg border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex flex-column align-items-center">
              <div
                className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-people fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark">Users</h5>
              <p className="fs-4 fw-bold text-success mb-0">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Orders Count */}
        <div className="col-md-3">
          <div className="card shadow-lg border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex flex-column align-items-center">
              <div
                className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-bag-check fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark">Orders</h5>
              <p className="mb-1 text-primary">
                Started:{" "}
                <strong>
                  {orders.filter((o) => o.status === "Placed").length}
                </strong>
              </p>
              <p className="mb-1 text-warning">
                In Progress:{" "}
                <strong>
                  {orders.filter((o) => o.status === "Processing").length}
                </strong>
              </p>
              <p className="mb-1 text-info">
                Shipped:{" "}
                <strong>
                  {orders.filter((o) => o.status === "Shipped").length}
                </strong>
              </p>
              <p className="mb-0 text-success">
                Delivered:{" "}
                <strong>
                  {orders.filter((o) => o.status === "Delivered").length}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="col-md-3">
          <div className="card shadow-lg border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex flex-column align-items-center">
              <div
                className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-box-seam fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark">Products</h5>
              <p className="mb-1 text-primary">
                Men:{" "}
                <strong>
                  {
                    products.filter(
                      (p) => p.category?.toLowerCase() === "men" && p.isApproved
                    ).length
                  }
                </strong>
              </p>
              <p className="mb-1 text-pink">
                Women:{" "}
                <strong>
                  {
                    products.filter(
                      (p) =>
                        p.category?.toLowerCase() === "women" && p.isApproved
                    ).length
                  }
                </strong>
              </p>
              <p className="mb-1 text-warning">
                Kids:{" "}
                <strong>
                  {
                    products.filter(
                      (p) =>
                        p.category?.toLowerCase() === "child" && p.isApproved
                    ).length
                  }
                </strong>
              </p>
              <p className="mb-0 text-danger">
                Unauthorized:{" "}
                <strong>{products.filter((p) => !p.isApproved).length}</strong>
              </p>
            </div>
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
