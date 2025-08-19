import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Card, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

export function FitFusionUserProfile() {
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          withCredentials: true,
        });
        const { name, email, phone, addresses } = res.data;
        setUser({ name, email, phone, addresses });
        setEditableUser({ name, email, phone });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = { ...editableUser, [name]: value };
    setEditableUser(updatedUser);

    const isModified = Object.keys(updatedUser).some(
      (key) => updatedUser[key] !== user[key]
    );
    setIsDirty(isModified);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/user/profile`, editableUser, {
        withCredentials: true,
      });
      toast.success("Profile updated successfully!");
      setUser({ ...user, ...editableUser });
      setIsDirty(false);
      setEditMode({ name: false, email: false, phone: false });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const refreshAddresses = async () => {
    const profileRes = await axios.get(`${API_BASE_URL}/api/user/profile`, {
      withCredentials: true,
    });
    setUser(profileRes.data);
  };

  const handleAddOrUpdateAddress = async () => {
    try {
      if (editingAddressId) {
        // Update existing address
        const res = await axios.put(
          `${API_BASE_URL}/api/user/address/${editingAddressId}`,
          newAddress,
          { withCredentials: true }
        );

        const updatedAddresses = user.addresses.map((addr) =>
          addr._id === editingAddressId ? res.data : addr
        );

        setUser((prev) => ({ ...prev, addresses: updatedAddresses }));
        toast.success("Address updated!");
      } else {
        // Add new address
        const res = await axios.post(
          `${API_BASE_URL}/api/user/address`,
          newAddress,
          {
            withCredentials: true,
          }
        );
        setUser((prev) => ({
          ...prev,
          addresses: [...prev.addresses, res.data],
        }));
        toast.success("Address added!");
      }

      await refreshAddresses();

      setShowAddressForm(false);
      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        phone: "",
      });
      setEditingAddressId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  const handleEditAddress = (addr) => {
    setNewAddress({ ...addr });
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/user/address/${id}`, {
        withCredentials: true,
      });

      setUser((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((addr) => addr._id !== id),
      }));

      toast.success("Address deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    }
  };

  if (!user) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <Card className="p-4 shadow rounded-4">
            <h3 className="text-center text-primary mb-4">User Profile</h3>
            <Form>
              {/* Name Field */}
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    name="name"
                    value={editableUser.name}
                    onChange={handleChange}
                    readOnly={!editMode.name}
                  />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, name: !prev.name }))
                    }
                  >
                    {editMode.name ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </Form.Group>

              {/* Email Field */}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    name="email"
                    value={editableUser.email}
                    onChange={handleChange}
                    readOnly={!editMode.email}
                  />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, email: !prev.email }))
                    }
                  >
                    {editMode.email ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </Form.Group>

              {/* Phone Field */}
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    name="phone"
                    value={editableUser.phone}
                    onChange={handleChange}
                    readOnly={!editMode.phone}
                  />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, phone: !prev.phone }))
                    }
                  >
                    {editMode.phone ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </Form.Group>

              <Button
                variant="primary"
                className="w-100"
                onClick={handleSave}
                disabled={!isDirty}
              >
                Save Changes
              </Button>
            </Form>

            <hr className="my-4" />

            <h5 className="mt-4">Addresses</h5>

            {user.addresses?.length > 0 ? (
              user.addresses.map((addr) => (
                <Card key={addr._id} className="mb-3 p-3">
                  <Row>
                    <Col xs={12} md={9}>
                      <b>{addr.name}</b>
                      <p className="mb-1">
                        {addr.street}, {addr.city}, {addr.state} -{" "}
                        {addr.pincode}
                      </p>
                      <p className="mb-0">
                        {addr.country} | 📞 {addr.phone}
                      </p>
                    </Col>
                    <Col
                      xs={12}
                      md={3}
                      className="d-flex flex-column justify-content-center gap-2 mt-2 mt-md-0"
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditAddress(addr)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteAddress(addr._id)}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <p>No addresses added yet.</p>
            )}

            <Button
              variant="outline-success"
              className="mt-3 w-100"
              onClick={() => {
                setShowAddressForm(!showAddressForm);
                setNewAddress({
                  name: "",
                  street: "",
                  city: "",
                  state: "",
                  pincode: "",
                  country: "India",
                  phone: "",
                });
                setEditingAddressId(null);
              }}
            >
              {showAddressForm ? "Cancel" : "Add Address"}
            </Button>

            {showAddressForm && (
              <Form className="mt-3">
                <Row>
                  {[
                    "name",
                    "street",
                    "city",
                    "state",
                    "pincode",
                    "country",
                    "phone",
                  ].map((field) => (
                    <Col xs={12} sm={6} key={field}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </Form.Label>
                        <Form.Control
                          name={field}
                          value={
                            field === "country" ? "India" : newAddress[field]
                          }
                          readOnly={field === "country"}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              [field]: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                <Button className="w-100" onClick={handleAddOrUpdateAddress}>
                  {editingAddressId ? "Update Address" : "Submit Address"}
                </Button>
              </Form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
