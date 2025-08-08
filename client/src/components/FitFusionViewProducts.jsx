import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Spinner } from "react-bootstrap";
import { useCookies } from "react-cookie";
import VariantEditModal from "./VariantEditModal";
import { ToastContainer, toast } from "react-toastify";

export default function FitFusionViewProducts() {
  const [products, setProducts] = useState([]);
  const [cookies] = useCookies(["userId"]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      if (!cookies.userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:3005/api/product/seller/${cookies.userId}/products`
      );
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure to delete this product?")) {
      try {
        await axios.delete(
          `http://localhost:3005/api/product/products/${productId}`
        );
        fetchProducts();
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  const handleEditVariant = (productId, variant) => {
    setEditingVariant({ productId, variant });
    setShowModal(true);
  };

  const handleDeleteVariant = async (productId, variantId) => {
    if (confirm("Are you sure to delete this variant?")) {
      try {
        await axios.delete(
          `http://localhost:3005/api/product/products/${productId}/variant/${variantId}`
        );
        fetchProducts();
      } catch (err) {
        alert("Failed to delete variant");
      }
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
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
        <p>No products found.</p>
      )}

      {products.map((p) => (
        <div key={p._id} className="border p-3 my-2">
          <h5>
            {p.name} ({p.category})
          </h5>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteProduct(p._id)}
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
                <th>Actions</th>
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
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditVariant(p._id, v)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteVariant(p._id, v._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}

      {showModal && editingVariant && (
        <VariantEditModal
          show={showModal}
          onHide={() => setShowModal(false)}
          productId={editingVariant.productId}
          variant={editingVariant.variant}
          onSave={fetchProducts}
        />
      )}
    </>
  );
}
