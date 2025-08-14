import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
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
    createdBy: "Admin", // can be dynamic
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoriesChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData({ ...formData, applicableCategories: options });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // For simplicity, storing file names. Replace with upload logic to Cloudinary/S3
    const fileNames = files.map((file) => URL.createObjectURL(file));
    setFormData({ ...formData, images: fileNames });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3005/api/advertisement", formData);
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
      toast.error("Failed to add advertisement.");
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
              <Form.Label>Images</Form.Label>
              <Form.Control type="file" multiple onChange={handleImageUpload} />
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

        <Button type="submit">Add Advertisement</Button>
      </Form>
    </Container>
  );
}
