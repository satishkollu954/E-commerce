import React from "react";

export default function FitFusionViewProducts({ products, onEdit, onDelete }) {
  const handleEditVariant = (productId, variant) => {
    console.log("Editing variant:", variant);
    onEdit({ ...variant, productId }); // pass both
  };

  const handleDeleteVariant = async (productId, variantId) => {
    console.log("Deleting variant:", variantId, "for product:", productId);
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        await axios.delete(
          `http://localhost:3005/api/product/products/${productId}/variant/${variantId}`
        );
        window.location.reload(); // or use a prop method like fetchProducts()
      } catch (err) {
        alert("Failed to delete variant");
      }
    }
  };

  return (
    <div className="card shadow-sm p-3">
      <h4>My Products</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Category</th>
              <th>Image</th>
              <th>Approve Status</th>
              <th>Variants (Stock, AgeGroup)</th>
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
                  <td>{p.category}</td>
                  <td>
                    <img
                      src={`http://localhost:3005${p.images?.[0]}`}
                      alt="Product"
                      width="80"
                      height="80"
                    />
                  </td>
                  <td>{p.isApproved ? "✅ Approved" : "⏳ Pending"}</td>
                  <td>
                    {p.variants?.map((variant) => (
                      <div key={variant._id} className="mb-2">
                        <div>
                          Stock: {variant.stock}, Age Group: {variant.ageGroup}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-info me-1 mt-1"
                          onClick={() => handleEditVariant(p._id, variant)}
                        >
                          Edit Variant
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger mt-1"
                          onClick={() =>
                            handleDeleteVariant(p._id, variant._id)
                          }
                        >
                          Delete Variant
                        </button>
                      </div>
                    ))}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info mb-1"
                      onClick={() => onEdit(p)}
                    >
                      Edit Product
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(p._id)}
                    >
                      Delete Product
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
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
