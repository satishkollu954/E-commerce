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
    sku: "",
    colors: [],
    variants: [],
    images: [],
    shippingCharge: 0,
    deliveryTime: "3-5 business days",
    tags: [],
  });

  const [variant, setVariant] = useState({
    size: "",
    childAgeGroup: "",
    price: "",
    discount: "",
    stock: "",
    images: [],
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({ ...editingProduct });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const arrayFields = ["colors", "tags"];
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
      const imgForm = new FormData();
      imgForm.append("file", file);

      try {
        const res = await axios.post(
          "http://localhost:3005/api/upload/products",
          imgForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedUrls.push(res.data.filePath);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }

    setFormData((prev) => ({ ...prev, images: uploadedUrls }));
  };

  const handleVariantImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const imgForm = new FormData();
      imgForm.append("file", file);

      try {
        const res = await axios.post(
          "http://localhost:3005/api/upload/products",
          imgForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedUrls.push(res.data.filePath);
      } catch (err) {
        console.error("Variant image upload failed:", err);
      }
    }

    setVariant((prev) => ({ ...prev, images: uploadedUrls }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addVariant = () => {
    if (
      (formData.category === "child" && variant.childAgeGroup) ||
      (formData.category !== "child" && variant.size)
    ) {
      const alreadyExists = formData.variants.some((v) =>
        formData.category === "child"
          ? v.childAgeGroup === variant.childAgeGroup
          : v.size === variant.size
      );

      if (alreadyExists) {
        toast.warning("This size/age group has already been added.");
        return;
      }

      // Add variantType to capture type at the time of adding
      const newVariant = {
        ...variant,
        variantType: formData.category === "child" ? "child" : "size",
      };

      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, newVariant],
      }));

      setVariant({
        size: "",
        childAgeGroup: "",
        price: "",
        discount: "",
        stock: "",
        images: [],
      });
    } else {
      toast.warning("Please enter required variant fields.");
    }
  };

  const handleSubmit = async (e) => {
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
        sku: "",
        colors: [],
        variants: [],
        images: [],
        shippingCharge: 0,
        deliveryTime: "3-5 business days",
        tags: [],
      });

      onProductSaved();
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("You are not authorized to add products");
        return;
      }
      toast.error("Failed to save product");
      console.error("Error saving product", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4  shadow-sm mb-4">
      <ToastContainer />
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
            <option value="unisex">Unisex</option>
          </select>
        </div>

        {/* VARIANT SECTION */}
        <div className="col-md-12 mb-3">
          <h6>Add Variant</h6>
          {formData.category === "child" ? (
            <select
              name="childAgeGroup"
              value={variant.childAgeGroup}
              onChange={handleVariantChange}
              className="form-select mb-2"
            >
              <option value="">Select Age Group</option>
              <option value="5-6">5-6</option>
              <option value="7-8">7-8</option>
              <option value="9-10">9-10</option>
              <option value="11-12">11-12</option>
              <option value="13-14">13-14</option>
            </select>
          ) : (
            <select
              name="size"
              value={variant.size}
              onChange={handleVariantChange}
              className="form-select mb-2"
            >
              <option value="">Select Size</option>

              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          )}
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={variant.price}
            onChange={handleVariantChange}
            className="form-control mb-2"
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            value={variant.discount}
            onChange={handleVariantChange}
            className="form-control mb-2"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={variant.stock}
            onChange={handleVariantChange}
            className="form-control mb-2"
          />
          {/* <input
            type="file"
            multiple
            onChange={handleVariantImageUpload}
            className="form-control mb-2"
          /> */}

          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={addVariant}
          >
            Add Variant
          </button>
        </div>

        {/* Display Variants */}
        {formData.variants.map((v, idx) => (
          <li key={idx}>
            {v.variantType === "child"
              ? `Age: ${v.childAgeGroup}`
              : `Size: ${v.size}`}{" "}
            | ₹{v.price} | Discount: {v.discount}% | Stock: {v.stock}
          </li>
        ))}

        <div className="col-md-6 mb-2">
          <input
            type="text"
            name="colors"
            placeholder="Colors (comma separated)"
            value={formData.colors}
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

        <div className="col-md-3 mb-2">
          <input
            type="number"
            name="shippingCharge"
            placeholder="Shipping Charge"
            value={formData.shippingCharge}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-3 mb-2">
          <input
            type="text"
            name="deliveryTime"
            placeholder="Delivery Time"
            value={formData.deliveryTime}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      </div>

      <div className="col-12 d-grid">
        <button type="submit" className="btn btn-primary">
          {editingProduct ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
