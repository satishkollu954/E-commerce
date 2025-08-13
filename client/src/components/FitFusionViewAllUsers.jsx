import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Modal,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

export function FitFusionViewAllUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3005/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setOriginalData({ ...user });
    setIsChanged(false);
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    const updatedUser = { ...editUser, [field]: value };
    setEditUser(updatedUser);

    // Detect changes
    const changed = Object.keys(updatedUser).some(
      (key) => updatedUser[key] !== originalData[key]
    );
    setIsChanged(changed);
  };

  const handleSave = async () => {
    const updatedFields = {};
    Object.keys(editUser).forEach((key) => {
      if (editUser[key] !== originalData[key]) {
        updatedFields[key] = editUser[key];
      }
    });

    delete updatedFields._id;

    try {
      await axios.put(
        `http://localhost:3005/api/admin/user/${editUser._id}`,
        updatedFields,
        { withCredentials: true }
      );
      setShowModal(false);
      toast.success("User updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Error updating user");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3005/api/admin/user/${deleteId}`);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div>
      {/* Search */}
      <Form className="mb-3">
        <InputGroup className="w-50">
          <Form.Control
            type="text"
            placeholder="Search by Name, Email, Phone"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>
      </Form>

      {/* Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(u)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setDeleteId(u._id);
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
              <td colSpan="6" className="text-center text-muted">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => setCurrentPage(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        {editUser && (
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={editUser.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  value={editUser.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email (Read Only)</Form.Label>
                <Form.Control value={editUser.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control value={editUser.role} disabled />
              </Form.Group>
            </Form>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!isChanged}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user? This action cannot be
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
    </div>
  );
}
