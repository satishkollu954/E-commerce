import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Alert,
  Spinner,
  Pagination,
  Modal,
  Form,
} from "react-bootstrap";
import { useCookies } from "react-cookie";
import VariantEditModal from "./VariantEditModal";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function FitFusionViewProducts() {
  const [products, setProducts] = useState([]);
  const [cookies] = useCookies(["userId"]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & selection states for deletion
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null); // { productId, variantId }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      if (!cookies.userId) {
        setError("User not logged in");
        return [];
      }

      const res = await axios.get(
        `${API_BASE_URL}/api/product/seller/${cookies.userId}/products`
      );

      const fetchedProducts = res.data.products || [];
      setProducts(fetchedProducts);
      return fetchedProducts;
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const confirmDeleteProduct = (productId) => {
    setSelectedProductId(productId);
    setShowDeleteProductModal(true);
  };

  const confirmDeleteVariant = (productId, variantId) => {
    setSelectedVariant({ productId, variantId });
    setShowDeleteVariantModal(true);
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
        fetchProducts(currentPage);
      }
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } finally {
      setShowDeleteProductModal(false);
      setSelectedProductId(null);
    }
  };

  const handleDeleteVariant = async () => {
    try {
      const { productId, variantId } = selectedVariant;
      await axios.delete(
        `${API_BASE_URL}/api/product/products/${productId}/variant/${variantId}`
      );
      toast.success("Variant deleted successfully");
      fetchProducts(currentPage);
    } catch (err) {
      toast.error("Failed to delete variant");
      console.error(err);
    } finally {
      setShowDeleteVariantModal(false);
      setSelectedVariant(null);
    }
  };

  const handleEditVariant = (productId, variant) => {
    setEditingVariant({ productId, variant });
    setShowVariantModal(true);
  };

  const handleEditProduct = (productId) => {
    const productToEdit = products.find((p) => p._id === productId);
    if (productToEdit) {
      setEditingProduct({ ...productToEdit });
      setShowProductModal(true);
    }
  };

  const handleSaveProduct = async () => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/product/products/${editingProduct._id}`,
        {
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description,
        }
      );

      setShowProductModal(false);
      toast.success("Product updated successfully");
      fetchProducts(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  const filteredProducts = products.filter((p) =>
    [p.name, p.sku, p.category]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />
      <h3>My Products</h3>
      <Form.Control
        type="text"
        placeholder="Search by name, SKU, or category..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-50"
      />

      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-2">
          {error}
        </Alert>
      )}

      {products?.length === 0 && !loading && !error && (
        <div className="text-center mt-4">
          <img
            src="/public/wishlist.png" // Make sure this path is correct
            alt="No Products"
            style={{ width: "200px", height: "200px", opacity: 0.7 }}
          />
          <p className="mt-3 text-muted">No products found</p>
        </div>
      )}

      {currentProducts.map((p) => (
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
                      <td>{v.discount}%</td>
                      <td>
                        {p.isApproved ? (
                          <span className="badge bg-success">Approved</span>
                        ) : (
                          <span className="badge bg-secondary">Pending</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditVariant(p._id, v)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDeleteVariant(p._id, v._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
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
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
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

      {/* Edit Variant Modal */}
      {showVariantModal && editingVariant && (
        <VariantEditModal
          show={showVariantModal}
          onHide={() => setShowVariantModal(false)}
          productId={editingVariant.productId}
          variant={editingVariant.variant}
          onSave={() => fetchProducts(currentPage)}
        />
      )}

      {/* Product Delete Confirmation Modal */}
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

      {/* Variant Delete Confirmation Modal */}
      <Modal
        show={showDeleteVariantModal}
        onHide={() => setShowDeleteVariantModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Variant Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this variant?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteVariantModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteVariant}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        centered
      >
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
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  disabled={editingProduct.category === "child"} // disable if current is child
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>

                  {/* Show child only if current category is child */}
                  {editingProduct.category === "child" && (
                    <option value="child">Child</option>
                  )}
                </Form.Select>
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
              </Form.Group>
              {/* <Form.Group className="mb-3">
                <Form.Label>Product Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image: e.target.files[0], // store the file
                    })
                  }
                />
              </Form.Group> */}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowProductModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProduct}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
