import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

export function FitFusionViewAllUsers() {
  const [users, setUsers] = useState([]);
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

    // Check if something changed compared to original
    const changed = Object.keys(updatedUser).some(
      (key) => updatedUser[key] !== originalData[key]
    );
    setIsChanged(changed);
  };

  const handleSave = async () => {
    // Build an object with only changed fields
    const updatedFields = {};
    Object.keys(editUser).forEach((key) => {
      if (editUser[key] !== originalData[key]) {
        updatedFields[key] = editUser[key];
      }
    });

    // Avoid sending _id or unchanged fields
    delete updatedFields._id;

    try {
      const res = await axios.put(
        `http://localhost:3005/api/admin/user/${editUser._id}`,
        updatedFields,
        { withCredentials: true }
      );
      setShowModal(false);
      toast.success("update successfully");

      fetchUsers();
    } catch (err) {
      toast.error("Error updating user", err);
    }
  };

  const handleDelete = async () => {
    console.log("====", deleteId);
    try {
      await axios.delete(`http://localhost:3005/api/admin/user/${deleteId}`);
      toast.success("User deleted successfully");

      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete User");
    }
  };

  return (
    <div>
      <h2 className="mb-4">Users</h2>
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
          {users.map((u) => (
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
          ))}
        </tbody>
      </Table>

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
                <Form.Control
                  value={editUser.role}
                  disabled
                  onChange={(e) => handleChange("role", e.target.value)}
                ></Form.Control>
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
    </div>
  );
}
