import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

export function FitFusionUserProfile() {
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile"); // 🔁 Change endpoint as needed
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

  // Detect field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = { ...editableUser, [name]: value };
    setEditableUser(updatedUser);

    // Enable save only if any field is modified
    const isModified = Object.keys(updatedUser).some(
      (key) => updatedUser[key] !== user[key]
    );
    setIsDirty(isModified);
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      await axios.put("/api/user/profile", editableUser); // 🔁 Change endpoint as needed
      toast.success("Profile updated successfully!");
      setUser({ ...user, ...editableUser });
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  // Address handling
  const handleAddAddress = async () => {
    try {
      const res = await axios.post("/api/user/address", newAddress);
      setUser((prev) => ({
        ...prev,
        addresses: [...prev.addresses, res.data],
      }));
      toast.success("Address added!");
      setShowAddressForm(false);
      setNewAddress({
        label: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add address");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Card className="p-4 shadow rounded-4 m-3">
      <h3>User Profile</h3>
      <Form>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            name="name"
            value={editableUser.name}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email"
            value={editableUser.email}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Phone</Form.Label>
          <Form.Control
            name="phone"
            value={editableUser.phone}
            onChange={handleChange}
          />
        </Form.Group>

        <Button
          variant="primary"
          className="mt-3"
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </Form>

      <hr />

      <h5 className="mt-4">Addresses</h5>
      {user.addresses?.length > 0 ? (
        user.addresses.map((addr) => (
          <Card key={addr._id} className="mb-2 p-2">
            <b>{addr.label}</b>
            <p>
              {addr.street}, {addr.city}, {addr.state} - {addr.pincode},{" "}
              {addr.country}
            </p>
          </Card>
        ))
      ) : (
        <p>No addresses added yet.</p>
      )}

      <Button
        variant="outline-success"
        className="mt-2"
        onClick={() => setShowAddressForm(!showAddressForm)}
      >
        {showAddressForm ? "Cancel" : "Add Address"}
      </Button>

      {showAddressForm && (
        <Form className="mt-3">
          <Row>
            {["label", "street", "city", "state", "pincode", "country"].map(
              (field) => (
                <Col sm={6} key={field}>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Form.Label>
                    <Form.Control
                      name={field}
                      value={newAddress[field]}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          [field]: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              )
            )}
          </Row>
          <Button onClick={handleAddAddress}>Submit Address</Button>
        </Form>
      )}
    </Card>
  );
}
