// FitFusionSellerDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import AddProduct from "../components/FitFusionAddProducts";
import ViewProducts from "../components/FitFusionViewProducts";

export function FitFusionSellerDashboard() {
  const [cookies] = useCookies(["userId"]);
  const userId = cookies.userId;
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("add"); // "add", "view", "orders"
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (view === "view") fetchProducts();
  }, [view]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3005/api/products/seller/${userId}`
      );
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  return (
    <div className="container-fluid mt-3">
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
            {/* <li
              className={`list-group-item ${view === "orders" ? "active" : ""}`}
              style={{ cursor: "pointer" }}
            >
              🧾 View Orders (Coming Soon)
            </li> */}
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
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
