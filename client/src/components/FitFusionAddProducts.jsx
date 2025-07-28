import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";

export default function FitFusionAddProduct({
  onProductSaved,
  editingProduct,
}) {
  const [cookies] = useCookies(["userId"]);
  const userId = cookies.userId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "men",
    price: "",
    discount: 0,
    sku: "",
    sizes: [],
    colors: [],
    stockQuantity: 0,
    images: [],
    shippingCharge: 0,
    deliveryTime: "3-5 business days",
    tags: [],
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({ ...editingProduct });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const arrayFields = ["sizes", "colors", "tags"];
    setFormData({
      ...formData,
      [name]: arrayFields.includes(name)
        ? value.split(",").map((s) => s.trim())
        : value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          "http://localhost:3005/api/upload?type=product",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Save relative URL like /products/123.jpg
        uploadedUrls.push(res.data.filePath);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setFormData((prev) => ({ ...prev, images: uploadedUrls }));
  };

  const handleSubmit = async (e) => {
    console.log("Form Data:", formData);
    e.preventDefault();
    const payload = { ...formData, seller: userId };

    try {
      if (editingProduct?._id) {
        await axios.put(
          `http://localhost:3005/api/product/${editingProduct._id}`,
          payload
        );
        toast.success("Product updated successfully");
      } else {
        await axios.post("http://localhost:3005/api/product", payload);
        toast.success("Product added successfully!");
      }

      setFormData({
        name: "",
        description: "",
        category: "men",
        price: "",
        discount: 0,
        // sku: "",
        sizes: [],
        colors: [],
        stockQuantity: 0,
        images: [],
        shippingCharge: 0,
        deliveryTime: "3-5 business days",
        tags: [],
      });
      onProductSaved();
    } catch (err) {
      toast.error("Failed to save product");
      console.error("Error saving product", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 vh-100 shadow-sm mb-4">
      <br />
      <h4>{editingProduct ? "Edit Product" : "Add New Product"}</h4>
      <div className="row">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        {/* <div className="col-md-6 mb-2">
          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={formData.sku}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div> */}
        <div className="col-md-12 mb-2">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="child">Child</option>
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            value={formData.discount}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-4 mb-2">
          <input
            type="text"
            name="sizes"
            placeholder="Sizes (comma separated)"
            value={formData.sizes}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-4 mb-2">
          <input
            type="text"
            name="colors"
            placeholder="Colors (comma separated)"
            value={formData.colors}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-4 mb-2">
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock"
            value={formData.stockQuantity}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-6 mb-2">
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-6 mb-2">
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="form-control"
          />
        </div>
      </div>{" "}
      <br />
      <div className="col-12 d-grid">
        <button type="submit" className="btn btn-primary">
          {editingProduct ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
