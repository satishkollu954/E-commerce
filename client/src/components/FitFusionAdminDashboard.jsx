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

export function FitFusionAdminDashboard() {
  const [activeTab, setActiveTab] = useState("sellers");
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [queries, setQueires] = useState([]);
  const [advertisement, setAdvertisement] = useState([]);

  const fetchSellers = () =>
    axios
      .get("http://localhost:3005/api/seller/getallsellers")
      .then((res) => setSellers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch sellers", err));

  const fetchUsers = () =>
    axios
      .get("http://localhost:3005/api/admin/users")
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch users", err));

  const fetchProducts = () =>
    axios
      .get("http://localhost:3005/api/product")
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch products", err));

  const fetchOrders = () =>
    axios
      .get("http://localhost:3005/api/order", {
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

      <div className="row mb-4 text-center">
        {/* Sellers Count */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm rounded-3 p-3 bg-light">
            <h5>Sellers</h5>
            <p className="fs-4 fw-bold mb-0">
              {sellers.filter((s) => s.isApproved).length}
            </p>
            <h5>Unauthorized Sellers</h5>
            <p className="fs-4 fw-bold mb-0">
              {sellers.filter((s) => !s.isApproved).length}
            </p>
          </div>
        </div>

        {/* Users Count */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm rounded-3 p-3 bg-light">
            <h5>Users</h5>
            <p className="fs-4 fw-bold mb-0">{users.length}</p>
          </div>
        </div>

        {/* Orders Count with breakdown */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm rounded-3 p-3 bg-light">
            <h5>Orders</h5>
            <p className="mb-1">
              Started:{" "}
              <strong>
                {orders.filter((o) => o.status === "Placed").length}
              </strong>
            </p>
            <p className="mb-1">
              In Progress:{" "}
              <strong>
                {orders.filter((o) => o.status === "Processing").length}
              </strong>
            </p>
            <p className="mb-0">
              Shipped:{" "}
              <strong>
                {orders.filter((o) => o.status === "Shipped").length}
              </strong>
            </p>

            <p className="mb-0">
              Delivered:{" "}
              <strong>
                {orders.filter((o) => o.status === "Delivered").length}
              </strong>
            </p>
          </div>
        </div>

        {/* Products Count by Category */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm rounded-3 p-3 bg-light">
            <h5>Products</h5>
            <p className="mb-1">
              Men:{" "}
              <strong>
                {
                  products.filter(
                    (p) =>
                      p.category?.toLowerCase() === "men" &&
                      p.isApproved === true
                  ).length
                }
              </strong>
            </p>
            <p className="mb-1">
              Women:{" "}
              <strong>
                {
                  products.filter(
                    (p) =>
                      p.category?.toLowerCase() === "women" &&
                      p.isApproved === true
                  ).length
                }
              </strong>
            </p>
            <p className="mb-0">
              Kids:{" "}
              <strong>
                {
                  products.filter(
                    (p) =>
                      p.category?.toLowerCase() === "child" &&
                      p.isApproved === true
                  ).length
                }
              </strong>
            </p>
            <p className="mb-0">
              Unauthorized products:{" "}
              <strong>{products.filter((p) => !p.isApproved).length}</strong>
            </p>
          </div>
        </div>
      </div>

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
