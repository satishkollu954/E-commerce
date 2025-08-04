import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  Table,
  Button,
  Modal,
  Tabs,
  Tab,
  Form,
  Container,
} from "react-bootstrap";
import axios from "axios";

export function FitFusionAdminDashboard() {
  const [activeTab, setActiveTab] = useState("sellers");
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState({
    sellers: "",
    users: "",
    products: "",
    orders: "",
  });
  // Pagination states
  const [sellerPage, setSellerPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const pageSize = 5;

  const fieldWhitelist = {
    sellers: ["name", "email", "phone", "storeName", "gstNumber", "isApproved"],
    users: ["name", "email", "phone"],
    products: [
      "name",
      "category",
      "stockQuantity",
      "price",
      "discount",
      "finalPrice",
      "isApproved",
    ],
    orders: ["_id", "user", "totalAmount", "status"],
  };

  const paginate = (data, page) => {
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  const paginatedSellers = paginate(sellers, sellerPage);
  const paginatedUsers = paginate(users, userPage);
  const paginatedOrders = paginate(orders, orderPage);
  const paginatedProducts = paginate(products, productPage);

  // Separate fetch hooks
  useEffect(() => {
    axios
      .get("http://localhost:3005/api/seller/getallsellers")
      .then((res) => setSellers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch sellers", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3005/api/admin/users")
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3005/api/product")
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch products", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3005/api/order/admin/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, []);

  const filterItems = (items, type) => {
    const term = search[type]?.toLowerCase() || "";
    if (!term) return items;

    return items.filter((item) => {
      if (type === "sellers" || type === "users") {
        return (
          item.name?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term)
        );
      } else if (type === "products") {
        return (
          item.name?.toLowerCase().includes(term) ||
          item._id?.toLowerCase().includes(term)
        );
      } else if (type === "orders") {
        return (
          item._id?.toLowerCase().includes(term) ||
          item.user?.name?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  };

  const handleEdit = (item) => {
    setEditItem({ ...item });
    setOriginalItem({ ...item });
  };

  const handleEditChange = (field, value) => {
    setEditItem((prev) => ({ ...prev, [field]: value }));
  };

  const isModified = () =>
    JSON.stringify(editItem) !== JSON.stringify(originalItem);

  const handleSave = async (type) => {
    try {
      let url = "";
      switch (type) {
        case "users":
          url = `http://localhost:3005/api/admin/user/${editItem._id}`;
          break;
        case "sellers":
          url = `http://localhost:3005/api/admin/seller/${editItem._id}`;
          break;
        case "products":
          url = `http://localhost:3005/api/admin/product/${editItem._id}`;
          break;
        case "orders":
          url = `http://localhost:3005/api/admin/order/${editItem._id}`;
          break;
        default:
          throw new Error("Unknown type");
      }

      await axios.put(url, editItem);
      setEditItem(null);
      toast.success("Item updated successfully");
      refreshData(type);
    } catch (error) {
      console.error("Save failed:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
        return;
      }
      toast.error("Failed to update item.");
    }
  };

  const handleDelete = (item, type) => {
    setDeleteTarget({ item, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const { item, type } = deleteTarget;
      let url = "";

      switch (type) {
        case "users":
          url = `http://localhost:3005/api/admin/user/${item._id}`;
          break;
        case "sellers":
          url = `http://localhost:3005/api/admin/seller/${item._id}`;
          break;
        case "products":
          url = `http://localhost:3005/api/admin/product/${item._id}`;
          break;
        case "orders":
          url = `http://localhost:3005/api/admin/order/${item._id}`;
          break;
        default:
          throw new Error("Unknown type");
      }

      await axios.delete(url);
      setShowDeleteModal(false);
      toast.success("Item deleted successfully");
      refreshData(type);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete item.");
    }
  };

  const refreshData = (type) => {
    const map = {
      sellers: () =>
        axios
          .get("http://localhost:3005/api/seller/getallsellers")
          .then((res) => setSellers(res.data)),
      users: () =>
        axios
          .get("http://localhost:3005/api/admin/users")
          .then((res) => setUsers(res.data)),
      products: () =>
        axios
          .get("http://localhost:3005/api/product")
          .then((res) => setProducts(res.data)),
      orders: () =>
        axios
          .get("http://localhost:3005/api/admin/orders")
          .then((res) => setOrders(res.data)),
    };
    if (map[type]) map[type]();
  };

  const filterProducts = (category) =>
    products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );

  const renderCell = (value) => {
    if (typeof value === "object" && value !== null) {
      return value.name || JSON.stringify(value);
    }
    return String(value);
  };

  const renderTable = (items, type, pageState, setPageState) => {
    const fields = fieldWhitelist[type] || [];
    const filteredItems = filterItems(items, type);
    const paginatedItems = paginate(filteredItems, pageState);

    return (
      <>
        <Form.Control
          size="sm"
          type="text"
          placeholder="Search..."
          className="mb-2"
          value={search[type]}
          onChange={(e) =>
            setSearch((prev) => ({ ...prev, [type]: e.target.value }))
          }
        />
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field}>{field}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => {
              const isEditing = editItem?._id === item._id;
              return (
                <tr key={item._id}>
                  {fields.map((field) => (
                    <td key={field}>
                      {isEditing ? (
                        field === "isApproved" ? (
                          <Form.Select
                            size="sm"
                            value={editItem[field] ?? ""}
                            onChange={(e) =>
                              handleEditChange(field, e.target.value === "true")
                            }
                          >
                            <option value="true">Approved</option>
                            <option value="false">Not Approved</option>
                          </Form.Select>
                        ) : (
                          <Form.Control
                            size="sm"
                            type="text"
                            value={editItem[field] ?? ""}
                            onChange={(e) =>
                              handleEditChange(field, e.target.value)
                            }
                            disabled={field === "email"}
                          />
                        )
                      ) : (
                        renderCell(item[field])
                      )}
                    </td>
                  ))}
                  <td>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          disabled={!isModified()}
                          onClick={() => handleSave(type)}
                          className="mb-1"
                        >
                          Save
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditItem(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleEdit(item)}
                          className="mb-1"
                        >
                          Edit
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(item, type)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            size="sm"
            variant="outline-primary"
            disabled={pageState === 1}
            onClick={() => setPageState((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span>Page {pageState}</span>
          <Button
            size="sm"
            variant="outline-primary"
            disabled={paginate(filteredItems, pageState + 1).length === 0}
            onClick={() => setPageState((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </>
    );
  };

  return (
    <Container className="py-4">
      <h3 className="text-center mb-4">Admin Dashboard</h3>

      <div className="row mb-4 text-center">
        {/* Sellers Count */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm rounded-3 p-3 bg-light">
            <h5>Sellers</h5>
            <p className="fs-4 fw-bold mb-0">{sellers.length}</p>
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
                {orders.filter((o) => o.status === "started").length}
              </strong>
            </p>
            <p className="mb-1">
              In Progress:{" "}
              <strong>
                {orders.filter((o) => o.status === "in progress").length}
              </strong>
            </p>
            <p className="mb-0">
              Completed:{" "}
              <strong>
                {orders.filter((o) => o.status === "completed").length}
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
                  products.filter((p) => p.category?.toLowerCase() === "men")
                    .length
                }
              </strong>
            </p>
            <p className="mb-1">
              Women:{" "}
              <strong>
                {
                  products.filter((p) => p.category?.toLowerCase() === "women")
                    .length
                }
              </strong>
            </p>
            <p className="mb-0">
              Kids:{" "}
              <strong>
                {
                  products.filter((p) => p.category?.toLowerCase() === "child")
                    .length
                }
              </strong>
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
          {renderTable(sellers, "sellers", sellerPage, setSellerPage)}
        </Tab>
        <Tab eventKey="users" title="Users">
          {renderTable(users, "users", userPage, setUserPage)}
        </Tab>
        <Tab eventKey="orders" title="Orders">
          {renderTable(orders, "orders", orderPage, setOrderPage)}
        </Tab>
        <Tab eventKey="products" title="Products">
          <Tabs defaultActiveKey="men" className="my-3">
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
          </Tabs>
        </Tab>
      </Tabs>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
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
