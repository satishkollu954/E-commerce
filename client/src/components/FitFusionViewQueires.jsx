import React, { useEffect, useState } from "react";
import "./FitFusionViewQueries.css";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

export function FitFusionViewQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch queries
  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/contact`);
      setQueries(res.data);
    } catch (error) {
      console.error("Error fetching queries:", error);
      toast.error("Failed to fetch queries.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const confirmDelete = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  // Delete query
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/contact/${selectedId}`);
      toast.success("Query deleted successfully!");
      setQueries(queries.filter((q) => q._id !== selectedId));
    } catch (error) {
      console.error("Error deleting query:", error);
      toast.error("Failed to delete query.");
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <Container className="py-2">
      <h2 className="mb-4 fw-bold">📩 Contact Queries</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : queries.length === 0 ? (
        <Alert variant="info">No queries found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((query) => (
              <tr key={query._id}>
                <td>{query.name}</td>
                <td>{query.email}</td>
                <td>{query.phone}</td>
                <td className="message-cell">{query.message}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => confirmDelete(query._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this query? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
