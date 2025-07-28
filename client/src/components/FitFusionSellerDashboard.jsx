import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import AddProduct from "../components/FitFusionAddProducts";
import ViewProducts from "../components/FitFusionViewProducts";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionSellerDashboard() {
  const [cookies] = useCookies(["userId"]);
  const userId = cookies.userId;
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("add"); // "add", "view", "orders"
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (view === "view") fetchProducts();
  }, [view]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3005/api/product/seller/${userId}/products`
      );
      setProducts(Array.isArray(res.data.products) ? res.data.products : []);
    } catch (err) {
      toast.error("Failed to fetch products");
      console.error("Error fetching products", err);
    }
  };

  const handleProductSaved = () => {
    setView("view");
    fetchProducts();
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setView("add");
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3005/api/product/${productToDelete}`
      );
      fetchProducts();
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Failed to delete product");
      console.error("Error deleting product", err);
    } finally {
      setShowModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <ToastContainer />
      <div className="row">
        <div className="col-md-3 border-end">
          <h5 className="mb-4">Seller Panel</h5>
          <ul className="list-group">
            <li
              className={`list-group-item ${view === "add" ? "active" : ""}`}
              onClick={() => {
                setView("add");
                setEditingProduct(null);
              }}
              style={{ cursor: "pointer" }}
            >
              ➕ Add Product
            </li>
            <li
              className={`list-group-item ${view === "view" ? "active" : ""}`}
              onClick={() => setView("view")}
              style={{ cursor: "pointer" }}
            >
              📦 View Products
            </li>
          </ul>
        </div>

        <div className="col-md-9">
          {view === "add" && (
            <AddProduct
              onProductSaved={handleProductSaved}
              editingProduct={editingProduct}
            />
          )}
          {view === "view" && (
            <ViewProducts
              products={products}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this product?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
