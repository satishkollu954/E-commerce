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
import { ToastContainer, toast } from "react-toastify";

export function FitFusionViewAllProducts() {
  const [products, setProducts] = useState([]);
  const [cookies] = useCookies(["userId"]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      if (!cookies.userId) {
        setError("User not logged in");
        return [];
      }

      const res = await axios.get(`http://localhost:3005/api/admin/products`);
      const fetchedProducts = res.data || [];
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

  const handleEditProduct = (productId) => {
    const productToEdit = products.find((p) => p._id === productId);
    if (productToEdit) {
      setEditingProduct({ ...productToEdit });
      setShowModal(true);
    }
  };

  const handleSaveProduct = async () => {
    try {
      await axios.put(
        `http://localhost:3005/api/admin/product/${editingProduct._id}`,
        {
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description,
          isApproved: editingProduct.isApproved,
        }
      );

      setShowModal(false);
      toast.success("Product updated success");
      fetchProducts(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  const confirmDeleteProduct = (productId) => {
    setSelectedProductId(productId);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(
        `http://localhost:3005/api/product/products/${selectedProductId}`
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <h3>My Products</h3>

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
            src="/public/wishlist.png"
            alt="No Products"
            style={{ width: "200px", height: "200px", opacity: 0.7 }}
          />
          <p className="mt-3 text-muted">No products found</p>
        </div>
      )}

      {currentProducts.map((p) => (
        <div key={p._id} className="border p-3 my-2">
          <h5>
            {p.name} ({p.category})
          </h5>

          {p.images?.[0] && (
            <img
              src={`http://localhost:3005/${p.images[0]}`}
              alt={p.name}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
          )}
          <br />
          <Button
            variant="warning"
            size="sm"
            className="me-2"
            onClick={() => handleEditProduct(p._id)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirmDeleteProduct(p._id)}
          >
            Delete Product
          </Button>

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
                  <td>{p.category === "child" ? v.childAgeGroup : v.size}</td>
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
      ))}

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
              <Form.Group className="mb-3">
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
              </Form.Group>
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
          <Button variant="primary" onClick={handleSaveProduct}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
