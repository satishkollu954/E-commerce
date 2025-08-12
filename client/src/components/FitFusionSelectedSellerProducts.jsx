import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Form, Pagination, Modal } from "react-bootstrap";
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

  function fetchProducts(sellerId) {
    if (sellerId) {
      axios
        .get(`http://localhost:3005/api/product/seller/${sellerId}/products`)
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
      toast.success("Product updated successfully");
      fetchProducts(sellerId);
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
    <div>
      <h4 className="d-flex justify-content-center mb-3">
        <strong>{sellerName} Products</strong>
      </h4>

      {/* ✅ Search Bar */}
      <div className="d-flex justify-content-center mb-3">
        <Form.Control
          type="text"
          placeholder="Search by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
          className="w-50"
        />
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
                  src={`http://localhost:3005${p.images[0]}`}
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
