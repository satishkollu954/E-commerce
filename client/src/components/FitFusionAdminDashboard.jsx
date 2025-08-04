import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaUser,
  FaStore,
  FaBox,
  FaShoppingCart,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export function FitFusionAdminDashboard() {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const sampleProduct = { name: "Product Name" };

  useEffect(() => {
    axios
      .get(`http://localhost:3005/api/seller/getallsellers`)
      .then((response) => {
        setSellers(response.data);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error fetching sellers:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3005/api/admin/users`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error fetching users:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3005/api/product`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error fetching men products:", error);
      });
  }, []);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditedName(product.name);
    setIsEdited(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // perform save logic here
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    // perform delete logic here
    setShowDeleteModal(false);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-light p-3 vh-100 shadow" style={{ width: "250px" }}>
        <h4 className="text-primary mb-4">Admin Panel</h4>
        <nav className="nav flex-column">
          <a
            href="#"
            className="nav-link"
            onClick={() => setSelectedSection("sellers")}
          >
            📋 View All Sellers
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={() => setSelectedSection("users")}
          >
            👥 View All Users
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={() => setSelectedSection("products")}
          >
            🛍️ View All Products
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={() => setSelectedSection("orders")}
          >
            📦 View All Orders
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <Container fluid className="p-4">
        {selectedSection === "dashboard" && (
          <>
            <h3 className="mb-4">Dashboard Overview</h3>
            <Row className="mb-4">
              <DashboardCard
                icon={<FaStore />}
                title="Sellers"
                count={sellers.length}
              />
              <DashboardCard
                icon={<FaUser />}
                title="Users"
                count={users.length}
              />
              <DashboardCard
                icon={<FaBox />}
                title="Products"
                count={men.length + women.length + kids.length}
              />
              <DashboardCard
                icon={<FaShoppingCart />}
                title="Orders"
                count="85"
              />
            </Row>
          </>
        )}

        {selectedSection === "sellers" && (
          <>
            <h4 className="mb-3">All Sellers</h4>
            <ListGroup>
              {sellers.map((seller) => (
                <ListGroup.Item
                  key={seller._id}
                  className="d-flex justify-content-between"
                >
                  {seller.name}
                  <div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger">
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}

        {selectedSection === "users" && (
          <>
            <h4 className="mb-3">All Users</h4>
            <ListGroup>
              {users.map((user) => (
                <ListGroup.Item
                  key={user._id}
                  className="d-flex justify-content-between"
                >
                  {user.name}
                  <div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger">
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}

        {selectedSection === "products" && (
          <>
            <h4 className="mb-3">Products by Category</h4>
            <Row>
              {[
                { name: "Men", data: men },
                { name: "Women", data: women },
                { name: "Kids", data: kids },
              ].map((category) => (
                <Col md={4} key={category.name}>
                  <Card className="mb-4 shadow-sm">
                    <Card.Header as="h5">
                      {category.name}'s Products
                    </Card.Header>
                    <ListGroup variant="flush">
                      {category.data.map((product) => (
                        <ListGroup.Item
                          key={product._id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span>{product.name}</span>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(product)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedProduct?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formProductName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              value={editedName}
              onChange={(e) => {
                setEditedName(e.target.value);
                setIsEdited(e.target.value !== selectedProduct?.name);
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSaveEdit}
            disabled={!isEdited}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ icon, title, count }) {
  return (
    <Col md={3}>
      <Card className="text-center mb-3 shadow-sm">
        <Card.Body>
          <div className="mb-2 text-primary" style={{ fontSize: "1.5rem" }}>
            {icon}
          </div>
          <Card.Title>{title}</Card.Title>
          <Card.Text className="fw-bold fs-4">{count}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}
