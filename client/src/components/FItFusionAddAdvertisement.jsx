import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Image } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

export function FitFusionAddAdvertisement() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [], // holds uploaded file paths from backend
    link: "",
    couponCode: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    applicableCategories: [],
    startDate: "",
    endDate: "",
    usageLimit: 0,
    perUserLimit: 0,
    isActive: true,
    createdBy: "Admin",
  });

  const [uploading, setUploading] = useState(false);

  // Handle basic input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle multi-select categories
  const handleCategoriesChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, applicableCategories: options }));
  };

  // Handle multiple image uploads
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const uploadData = new FormData();
    files.forEach((file) => uploadData.append("file", file)); // ✅ matches multer field name

    try {
      setUploading(true);
      const res = await axios.post(
        "http://localhost:3005/api/upload/advertisements",
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.filePaths) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.data.filePaths],
        }));
        toast.success("Images uploaded successfully!");
      } else {
        toast.error("Image upload failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading images.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Directly send JSON — images already uploaded and we have their file paths in formData.images
      await axios.post("http://localhost:3005/api/advertisement", formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Advertisement added successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        images: [],
        link: "",
        couponCode: "",
        discountType: "percentage",
        discountValue: 0,
        minPurchaseAmount: 0,
        maxDiscountAmount: 0,
        applicableCategories: [],
        startDate: "",
        endDate: "",
        usageLimit: 0,
        perUserLimit: 0,
        isActive: true,
        createdBy: "Admin",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to add advertisement."
      );
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Add Advertisement</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Upload Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {formData.images.length > 0 && (
                <div className="mt-3 d-flex flex-wrap gap-2">
                  {formData.images.map((img, i) => (
                    <Image
                      key={i}
                      src={`http://localhost:3005${img}`}
                      alt={`Uploaded ${i}`}
                      thumbnail
                      style={{ width: "100px", height: "100px" }}
                    />
                  ))}
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Categories</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={formData.applicableCategories}
                onChange={handleCategoriesChange}
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="child">Child</option>
                <option value="unisex">Unisex</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Add Advertisement"}
        </Button>
      </Form>
    </Container>
  );
}
