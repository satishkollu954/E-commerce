// components/seller/ViewProducts.jsx
import React from "react";

export default function FitFusionViewProducts({ products, onEdit, onDelete }) {
  return (
    <div className="card shadow-sm vh-100 p-3">
      <h4>My Products</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Approve status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>₹{p.price}</td>
                  <td>{p.discount}%</td>
                  <td>{p.stockQuantity}</td>
                  <td>{p.category}</td>
                  <td>{p.isApproved ? "Approved" : "Pending"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => onEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
