import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Spinner,
  Form,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";

export function FitFusionViewAllSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editData, setEditData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [initialApprovalStatus, setInitialApprovalStatus] = useState(
    editData.isApproved
  );

  useEffect(() => {
    if (editData) {
      setInitialApprovalStatus(editData.isApproved);
    }
  }, [editData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // change this to control per-page count

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3005/api/seller/getallsellers"
      );
      setSellers(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load sellers");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Delete seller
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3005/api/admin/seller/${deleteId}`);
      toast.success("Seller deleted successfully");
      setShowDeleteModal(false);
      fetchSellers();
    } catch (err) {
      toast.error("Failed to delete seller");
    }
  };

  // Edit seller
  const handleSaveEdit = async () => {
    const approvalChanged = editData.isApproved !== initialApprovalStatus;

    if (approvalChanged) {
      setApproveLoading(true);
    }

    try {
      await axios.put(
        `http://localhost:3005/api/admin/seller/${editData._id}`,
        editData
      );

      toast.success("Seller updated successfully");
      setShowEditModal(false);
      fetchSellers();
    } catch (err) {
      toast.error("Failed to update seller");
    } finally {
      if (approvalChanged) {
        setApproveLoading(false);
      }
    }
  };

  // Detect changes
  const isDataChanged = () => {
    return JSON.stringify(editData) !== JSON.stringify(originalData);
  };

  // Filter sellers by search term
  const filteredSellers = sellers.filter((seller) => {
    const term = searchTerm.toLowerCase();
    return (
      seller.name.toLowerCase().includes(term) ||
      seller.email.toLowerCase().includes(term) ||
      seller.storeName.toLowerCase().includes(term) ||
      seller.gstNumber.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSellers = filteredSellers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

  return (
    <div className="p-3">
      {/* Search Box */}
      <Form className="mb-3">
        <InputGroup className="w-50">
          <Form.Control
            type="text"
            placeholder="Search by Name, Email, Store Name, GST Number"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset to page 1 on search
            }}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>
      </Form>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Seller Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Store Name</th>
                <th>GST Number</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSellers.length > 0 ? (
                currentSellers.map((seller, index) => (
                  <tr key={seller._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{seller.name}</td>
                    <td>{seller.email}</td>
                    <td>{seller.phone}</td>
                    <td>{seller.storeName}</td>
                    <td>{seller.gstNumber}</td>
                    <td>{seller.isApproved ? "✅" : "❌"}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setEditData({ ...seller });
                          setOriginalData({ ...seller });
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setDeleteId(seller._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No sellers found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this seller? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Seller Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Seller Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email (Read-Only)</Form.Label>
                <Form.Control
                  type="email"
                  value={editData.email}
                  readOnly
                  plaintext
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Store Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editData.storeName}
                  onChange={(e) =>
                    setEditData({ ...editData, storeName: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  type="text"
                  value={editData.gstNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, gstNumber: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Approval Status</Form.Label>
                <Form.Select
                  value={editData.isApproved ? "true" : "false"}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      isApproved: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Approved ✅</option>
                  <option value="false">Not Approved ❌</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            disabled={!isDataChanged() || approveLoading}
            onClick={handleSaveEdit}
          >
            {approveLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Updating Approval...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
