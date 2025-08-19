import axios from "axios";
import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Accordion,
  Pagination,
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
  const [faqs, setFaqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const faqsPerPage = 5;

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/faqs`);
      setFaqs(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load FAQs.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  // Pagination logic
  const indexOfLastFaq = currentPage * faqsPerPage;
  const indexOfFirstFaq = indexOfLastFaq - faqsPerPage;
  const currentFaqs = faqs.slice(indexOfFirstFaq, indexOfLastFaq);
  const totalPages = Math.ceil(faqs.length / faqsPerPage);

  return (
    <Container className="my-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Contact Form Section */}
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <img
            src="/support.jpg"
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
                <Form.Label>Phone</Form.Label>
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

      {/* FAQ Section */}
      <Row>
        <Col>
          <h3 className="text-center text-primary mb-4">
            Frequently Asked Questions
          </h3>
          {faqs.length === 0 ? (
            <p className="text-center">No FAQs available at the moment.</p>
          ) : (
            <>
              <Accordion defaultActiveKey="0">
                {currentFaqs.map((faq, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={faq._id || idx}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
