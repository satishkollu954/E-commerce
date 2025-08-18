import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Image } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

export function FitFusionAddAdvertisement() {
  const [formData, setFormData] = useState({
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
    createdBy: "Admin", // ✅ stays hardcoded
  });

  const [uploading, setUploading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoriesChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, applicableCategories: options }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const uploadData = new FormData();
    files.forEach((file) => uploadData.append("file", file));

    try {
      setUploading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/upload/advertisements`,
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
      await axios.post(`${API_BASE_URL}/api/advertisement`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Advertisement added successfully!");

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
        {/* Title & Description */}
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

        {/* Image Upload & Link */}
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
                      src={`${API_BASE_URL}${img}`}
                      alt={`Uploaded ${i}`}
                      thumbnail
                      style={{ width: "100px", height: "100px" }}
                    />
                  ))}
                </div>
              )}
            </Form.Group>
          </Col>
          {/* <Col md={6}>
            <Form.Group>
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
              />
            </Form.Group>
          </Col> */}
        </Row>

        {/* Coupon Code & Discount Type */}
        <Row className="mb-3">
          {/* <Col md={6}>
            <Form.Group>
              <Form.Label>Coupon Code</Form.Label>
              <Form.Control
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
              />
            </Form.Group>
          </Col> */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Discount Type</Form.Label>
              <Form.Select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Discount & Purchase Limits */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Discount Value</Form.Label>
              <Form.Control
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Min Purchase Amount</Form.Label>
              <Form.Control
                type="number"
                name="minPurchaseAmount"
                value={formData.minPurchaseAmount}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Max Discount Amount</Form.Label>
              <Form.Control
                type="number"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Categories & Dates */}
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

        {/* Usage Limits & Status */}
        <Row className="mb-3">
          {/* <Col md={4}>
            <Form.Group>
              <Form.Label>Usage Limit</Form.Label>
              <Form.Control
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
              />
            </Form.Group>
          </Col> */}
          {/* <Col md={4}>
            <Form.Group>
              <Form.Label>Per User Limit</Form.Label>
              <Form.Control
                type="number"
                name="perUserLimit"
                value={formData.perUserLimit}
                onChange={handleChange}
              />
            </Form.Group>
          </Col> */}
          <Col md={4} className="d-flex align-items-center">
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Is Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
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
