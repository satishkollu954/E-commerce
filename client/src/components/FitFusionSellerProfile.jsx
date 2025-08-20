import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useCookies } from "react-cookie";

export function FitFusionSellerProfile() {
  const [sellerData, setSellerData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false); // Track changes
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [cookies] = useCookies(["userId"]);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/seller/getprofile`,
          {
            withCredentials: true,
          }
        );
        setSellerData(data);
        setFormData({ ...data, country: "India" });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch seller data.");
      }
    };
    fetchSeller();
  }, []);

  const excludedFields = [
    "_id",
    "role",
    "isApproved",
    "createdAt",
    "updatedAt",
    "__v",
    "products",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    const newFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(newFormData);

    // Check if data has changed compared to original
    const relevantOriginal = { ...sellerData, country: "India" };
    let dirty = false;
    for (const key in newFormData) {
      if (
        !excludedFields.includes(key) &&
        newFormData[key] !== relevantOriginal[key]
      ) {
        dirty = true;
        break;
      }
    }
    setIsDirty(dirty);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/seller/update`, formData, {
        withCredentials: true,
      });
      toast.success("Profile updated successfully!");
      setEditing(false);
      setIsDirty(false);
      setSellerData({ ...formData }); // update sellerData to new data
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  return (
    <Container className="mt-4">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />
      <h2 className="mb-4">Seller Profile</h2>
      {sellerData && (
        <Form>
          <Row>
            {Object.keys(formData).map((field) => {
              if (excludedFields.includes(field)) return null;

              return (
                <Col md={6} key={field} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name={field}
                      value={formData[field]}
                      readOnly={!editing || field === "country"}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              );
            })}
          </Row>
          <div className="d-flex gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <>
                <Button
                  variant="success"
                  onClick={handleUpdate}
                  disabled={!isDirty}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData({ ...sellerData, country: "India" });
                    setIsDirty(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </Form>
      )}
    </Container>
  );
}
