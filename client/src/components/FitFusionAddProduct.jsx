import React, { useRef, useState } from "react";
import axios from "axios";
import { Form, Button, Col, Row, Card, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

import { useCookies } from "react-cookie";

const childAgeGroups = ["5-6", "7-8", "9-10", "11-12", "13-14"];
const sizes = ["S", "M", "L", "XL", "XXL"];
const initialProduct = {
  name: "",
  description: "",
  category: "men",
  images: [],
  variants: [],
};

export default function FitFusionAddProduct({ editingProduct }) {
  const [cookies] = useCookies(["userId"]);
  const sellerId = cookies.userId;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "men",
    images: [], // Will store image paths like "/products/abc.jpg"
    variants: [],
  });

  const [variant, setVariant] = useState({
    size: "",
    childAgeGroup: "",
    price: "",
    stock: "",
    discount: 0,
  });

  const [alert, setAlert] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariant((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    if (
      (!variant.size && product.category !== "child") ||
      (!variant.childAgeGroup && product.category === "child") ||
      !variant.price ||
      !variant.stock
    ) {
      setAlert({
        type: "danger",
        message: "Please fill required variant fields.",
      });
      return;
    }

    // 🚨 Duplicate check
    const isDuplicate = product.variants.some((v) => {
      if (product.category === "child") {
        return v.childAgeGroup === variant.childAgeGroup;
      }
      return v.size === variant.size;
    });

    if (isDuplicate) {
      const warningMessage =
        product.category === "child"
          ? `Variant for age group "${variant.childAgeGroup}" already exists.`
          : `Variant with size "${variant.size}" already exists.`;

      // Show toast warning
      toast.warning(warningMessage);

      return;
    }
    // ✅ Add variant
    setProduct((prev) => ({
      ...prev,
      variants: [...prev.variants, variant],
    }));

    setVariant({
      size: "",
      childAgeGroup: "",
      price: "",
      stock: "",
      discount: 0,
    });

    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let uploadedImagePaths = [];

      // Upload images only if any are selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("file", file);
        });

        const res = await axios.post(
          "http://localhost:3005/api/upload/products",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedImagePaths = res.data.filePaths; // ✅ backend sends array
      }

      const productData = {
        ...product,
        images: uploadedImagePaths,
        sellerId: sellerId,
      };

      if (editingProduct) {
        await axios.put(
          `http://localhost:3005/api/products/${editingProduct._id}`,
          productData
        );
        toast.success("Product updated!");
      } else {
        await axios.post("http://localhost:3005/api/product", productData, {
          withCredentials: true,
        });
        toast.success("Product created!");
      }

      setProduct(initialProduct);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting product");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h3>Add New Product</h3>
      {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={product.name}
                onChange={handleProductChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={product.description}
                onChange={handleProductChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={product.category}
                onChange={handleProductChange}
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="child">Child</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formFile">
              <Form.Label>Product Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </Form.Group>

            {/* Image Previews */}
            <div className="mt-2 d-flex gap-2 flex-wrap">
              {previewImages.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  {/* ❌ Cancel Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "red",
                      border: "none",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>

                  {/* Image Preview */}
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    width="80"
                    height="80"
                    style={{
                      objectFit: "cover",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              ))}
            </div>
          </Col>
        </Row>

        <hr />
        <h5>Variants</h5>

        <Row className="mb-2">
          {product.category === "child" ? (
            <Col md={3}>
              <Form.Group>
                <Form.Label>Child Age Group</Form.Label>
                <Form.Select
                  name="childAgeGroup"
                  value={variant.childAgeGroup}
                  onChange={handleVariantChange}
                >
                  <option value="">Select Age Group</option>
                  {childAgeGroups.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          ) : (
            <Col md={3}>
              <Form.Group>
                <Form.Label>Size</Form.Label>
                <Form.Select
                  name="size"
                  value={variant.size}
                  onChange={handleVariantChange}
                >
                  <option value="">Select Size</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}

          <Col md={2}>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={variant.price}
                onChange={handleVariantChange}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={variant.stock}
                onChange={handleVariantChange}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                name="discount"
                value={variant.discount}
                onChange={handleVariantChange}
              />
            </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
            <Button variant="secondary" onClick={addVariant}>
              Add Variant
            </Button>
          </Col>
        </Row>

        {product.variants.length > 0 && (
          <Card className="mb-3">
            <Card.Body>
              <h6>Added Variants:</h6>
              <ul>
                {product.variants.map((v, idx) => (
                  <li key={idx}>
                    {product.category === "child" ? v.childAgeGroup : v.size} -
                    ₹{v.price} - {v.discount}% discout - {v.stock} in stock
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}

        <Button type="submit" variant="primary" disabled={uploading}>
          Submit Product
        </Button>
      </Form>
    </div>
  );
}
