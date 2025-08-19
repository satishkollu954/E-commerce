import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Form,
  Pagination,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionSelectedSellerProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // ✅ Number of products per page

  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const location = useLocation();
  const { sellerId, sellerName } = location.state || {};

  const [approveLoading, setApproveLoading] = useState(false);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [isApprovalUpdating, setIsApprovalUpdating] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  function fetchProducts(sellerId) {
    if (sellerId) {
      axios
        .get(`${API_BASE_URL}/api/product/seller/${sellerId}/products`)
        .then((res) => {
          const fetchProducts = res.data.products || [];
          setProducts(fetchProducts);
        });
    }
  }

  useEffect(() => {
    fetchProducts(sellerId);
  }, [sellerId]);

  // ✅ Filter products by name, SKU, or category
  const filteredProducts = products.filter((p) =>
    [p.name, p.sku, p.category]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (productId) => {
    const productToEdit = products.find((p) => p._id === productId);
    if (productToEdit) {
      setEditingProduct({ ...productToEdit });
      setShowModal(true);
    }
  };

  const handleSaveProduct = async () => {
    try {
      // Check if only isApproved changed
      const originalProduct = products.find(
        (p) => p._id === editingProduct._id
      );
      const approvalChanged =
        originalProduct &&
        originalProduct.isApproved !== editingProduct.isApproved;

      if (approvalChanged) {
        setIsApprovalUpdating(true); // Show spinner for approval change
      }

      await axios.put(
        `${API_BASE_URL}/api/admin/product/${editingProduct._id}`,
        {
          name: editingProduct.name,
          isApproved: editingProduct.isApproved,
        }
      );

      setShowModal(false);
      toast.success("Product updated successfully");
      fetchProducts(sellerId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    } finally {
      setIsApprovalUpdating(false); // Stop spinner
    }
  };

  const confirmDeleteProduct = (productId) => {
    setSelectedProductId(productId);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/product/products/${selectedProductId}`
      );
      toast.success("Product deleted");
      const isLastProductOnPage = products.length === 1 && currentPage > 1;
      if (isLastProductOnPage) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchProducts(sellerId);
      }
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } finally {
      setShowDeleteProductModal(false);
      setSelectedProductId(null);
    }
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container-fluid">
      <div className="row align-items-center my-4">
        {/* Left Side - Title + Search */}
        <div className="col-md-8 d-flex align-items-center gap-3 flex-wrap">
          <h3 className="fw-bold text-dark mb-0">
            <i className="bi bi-box-seam me-2 text-primary"></i>
            {sellerName} Products
          </h3>

          <Form.Control
            type="text"
            placeholder="🔍 Search by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="shadow-sm rounded-pill px-3 w-50 border-0"
            style={{ minWidth: "260px" }}
          />
        </div>

        {/* Right Side - Product Stats Card */}
        <div className="col-md-4">
          <div className="card shadow-lg rounded-4 border-0 p-3 bg-white">
            <h5 className="fw-semibold text-primary mb-3">
              <i className="bi bi-graph-up-arrow me-2"></i> Product Summary
            </h5>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                <i className="bi bi-person-fill me-2 text-secondary"></i> Men
              </span>
              <span className="fw-bold text-dark">
                {
                  products.filter(
                    (p) =>
                      p.category?.toLowerCase() === "men" &&
                      p.isApproved === true
                  ).length
                }
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                <i className="bi bi-person-fill me-2 text-pink"></i> Women
              </span>
              <span className="fw-bold text-dark">
                {
                  products.filter(
                    (p) =>
                      p.category?.toLowerCase() === "women" &&
                      p.isApproved === true
                  ).length
                }
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                <i className="bi bi-emoji-smile-fill me-2 text-warning"></i>{" "}
                Kids
              </span>
              <span className="fw-bold text-dark">
                {
                  products.filter(
                    (p) =>
                      p.category?.toLowerCase() === "child" &&
                      p.isApproved === true
                  ).length
                }
              </span>
            </div>

            <div className="d-flex justify-content-between">
              <span className="text-danger fw-semibold">
                <i className="bi bi-shield-exclamation me-2"></i> Unauthorized
              </span>
              <span className="fw-bold text-danger">
                {products.filter((p) => !p.isApproved).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ No products found */}
      {filteredProducts.length === 0 && (
        <div className="text-center mt-4">
          <img
            src="/public/wishlist.png"
            alt="No Products"
            style={{ width: "200px", height: "200px", opacity: 0.7 }}
          />
          <p className="mt-3 text-muted">No products found</p>
        </div>
      )}

      {/* ✅ Product List */}
      {paginatedProducts.map((p) => (
        <div key={p._id} className="border p-3 my-2">
          <div className="row">
            {/* Left - Image */}
            <div className="col-md-3 d-flex align-items-start">
              {p.images?.[0] && (
                <img
                  src={`${API_BASE_URL}${p.images[0]}`}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              )}
            </div>

            {/* Right - Details */}
            <div className="col-md-9">
              <h5>
                {p.name} ({p.category})
              </h5>
              <h6>{p.sku}</h6>

              <div className="mb-2">
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditProduct(p._id)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => confirmDeleteProduct(p._id)}
                >
                  <FaTrash />
                </Button>
              </div>

              {/* Variants Table */}
              <Table striped bordered hover size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>Size / Age Group</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Discount</th>
                    <th>Approve status</th>
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v) => (
                    <tr key={v._id}>
                      <td>
                        {p.category === "child" ? v.childAgeGroup : v.size}
                      </td>
                      <td>{v.price}</td>
                      <td>{v.stock}</td>
                      <td>{v.discount}</td>
                      <td>
                        {p.isApproved ? (
                          <span className="badge bg-success">Approved</span>
                        ) : (
                          <span className="badge bg-secondary">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      ))}

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => setCurrentPage(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      <Modal
        show={showDeleteProductModal}
        onHide={() => setShowDeleteProductModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Product Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this product?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteProductModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProduct && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
              {/* <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group> */}
              <Form.Group className="mb-3">
                <Form.Label>Is Approved</Form.Label>
                <Form.Select
                  value={editingProduct.isApproved}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      isApproved: e.target.value === "true", // convert to boolean
                    })
                  }
                >
                  <option value="true">Approved</option>
                  <option value="false">Not Approved</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveProduct}
            disabled={isApprovalUpdating}
          >
            {isApprovalUpdating ? (
              <Spinner
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
            ) : null}
            Save Changes
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
    </div>
  );
}
