import axios from "axios";
import { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

export function FitFusionContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation first
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/contact`, formData);

      if (res.status === 200 || res.status === 201) {
        toast.success("Thank you! We'll get back to you soon.");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Row className="align-items-center">
        <Col md={6}>
          <img
            src="/public/support.jpg"
            alt="Contact Us"
            className="img-fluid rounded shadow"
            style={{ maxHeight: "450px", objectFit: "cover", width: "100%" }}
          />
        </Col>

        <Col md={6}>
          <Card className="shadow p-4">
            <h3 className="mb-4 text-center text-primary">Get in Touch</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPhone">
                <Form.Label>Phone*</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter your phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formMessage">
                <Form.Label>Message*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Write your message here..."
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
