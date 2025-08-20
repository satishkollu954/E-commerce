import React, { useEffect, useState } from "react";
import { Carousel, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionViewAdvertisement() {
  const [validAds, setValidAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAd, setEditedAd] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [cookies, setCookies] = useCookies(["role"]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchAds = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/advertisement`);

      const today = new Date();
      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const activeAds = res.data.filter((ad) => {
        if (!ad.isActive) return false;

        const start = new Date(new Date(ad.startDate).setHours(0, 0, 0, 0));
        const end = new Date(new Date(ad.endDate).setHours(23, 59, 59, 999));

        return start <= todayDateOnly && end >= todayDateOnly;
      });

      setValidAds(activeAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageError = (adId, imgPath) => {
    setValidAds((prev) =>
      prev.map((ad) => ({
        ...ad,
        images: ad.images.filter((img) => `${API_BASE_URL}${img}` !== imgPath),
      }))
    );
  };

  const handleEditClick = () => {
    setEditedAd({ ...selectedAd });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...editedAd };

      if (!editedAd.newImages || editedAd.newImages.length === 0) {
        delete payload.images; // no new images
      } else {
        // Normalize single image to array
        payload.images = Array.isArray(editedAd.newImages)
          ? editedAd.newImages
          : [editedAd.newImages];
      }

      await axios.put(
        `${API_BASE_URL}/api/advertisement/${editedAd._id}`,
        payload,
        { withCredentials: true }
      );

      setValidAds((prev) =>
        prev.map((ad) => (ad._id === editedAd._id ? { ...ad, ...payload } : ad))
      );
      toast.success("Ad updated successfully");
      setSelectedAd({ ...selectedAd, ...payload });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving ad:", err);
      toast.error("Failed to update ad");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/advertisement/${selectedAd._id}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Deleted successfully");
      setTimeout(() => {
        setValidAds((prev) => prev.filter((ad) => ad._id !== selectedAd._id));
        setSelectedAd(null);
        setShowDeleteConfirm(false);
      }, 1500);
    } catch (err) {
      console.error("Error deleting ad:", err);
      toast.error("Failed to delete ad");
    }
  };

  const hasChanges =
    editedAd &&
    JSON.stringify({ ...editedAd, _id: undefined }) !==
      JSON.stringify({ ...selectedAd, _id: undefined });

  if (loading || validAds.length === 0) return null;

  return (
    <>
      <Carousel
        fade
        interval={2000}
        controls={false}
        pause={false}
        className="mt-1"
      >
        {validAds.flatMap((ad) =>
          ad.images?.map((imgPath, idx) => (
            <Carousel.Item key={`${ad._id}-${idx}`}>
              <img
                src={`${API_BASE_URL}${imgPath}`}
                alt={ad.title}
                style={{
                  objectFit: "cover",
                  height: "400px",
                  width: "100%",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedAd(ad);
                  setIsEditing(false);
                }}
                onError={() =>
                  handleImageError(ad._id, `${API_BASE_URL}${imgPath}`)
                }
              />
              {/* {ad.description && (
                <Carousel.Caption>
                  <p>{ad.description}</p>
                </Carousel.Caption>
              )} */}
            </Carousel.Item>
          ))
        )}
      </Carousel>

      {/* Details / Edit Modal */}
      <Modal
        show={!!selectedAd}
        onHide={() => setSelectedAd(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? (
              <Form.Control
                type="text"
                value={editedAd.title}
                onChange={(e) =>
                  setEditedAd({ ...editedAd, title: e.target.value })
                }
              />
            ) : (
              selectedAd?.title
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAd && (
            <div>
              {selectedAd.images?.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {selectedAd.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={`${API_BASE_URL}${img}`}
                      alt={`Offer ${idx}`}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ))}
                </div>
              )}

              {isEditing ? (
                <>
                  {/* Description */}
                  <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={editedAd.description}
                      onChange={(e) =>
                        setEditedAd({
                          ...editedAd,
                          description: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  {/* Discount Type */}
                  <Form.Group className="mb-2">
                    <Form.Label>Discount Type</Form.Label>
                    <Form.Select
                      value={editedAd.discountType}
                      onChange={(e) =>
                        setEditedAd({
                          ...editedAd,
                          discountType: e.target.value,
                        })
                      }
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Discount Value */}
                  <Form.Group className="mb-2">
                    <Form.Label>Discount Value</Form.Label>
                    <Form.Control
                      type="number"
                      value={editedAd.discountValue}
                      onChange={(e) =>
                        setEditedAd({
                          ...editedAd,
                          discountValue: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  {/* Min Purchase Amount */}
                  <Form.Group className="mb-2">
                    <Form.Label>Min Purchase Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={editedAd.minPurchaseAmount}
                      onChange={(e) =>
                        setEditedAd({
                          ...editedAd,
                          minPurchaseAmount: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  {/* Max Discount Amount */}
                  <Form.Group className="mb-2">
                    <Form.Label>Max Discount Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={editedAd.maxDiscountAmount}
                      onChange={(e) =>
                        setEditedAd({
                          ...editedAd,
                          maxDiscountAmount: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  {/* Categories */}
                  <Form.Group className="mb-2">
                    <Form.Label>
                      Applicable Categories (comma separated)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editedAd.applicableCategories?.join(", ")}
                      onChange={(e) =>
                        setEditedAd({
                          ...editedAd,
                          applicableCategories: e.target.value
                            .split(",")
                            .map((c) => c.trim()),
                        })
                      }
                    />
                  </Form.Group>

                  {/* Start Date */}
                  <Form.Group className="mb-2">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={editedAd.startDate?.slice(0, 10)}
                      onChange={(e) =>
                        setEditedAd({ ...editedAd, startDate: e.target.value })
                      }
                    />
                  </Form.Group>

                  {/* End Date */}
                  <Form.Group className="mb-2">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={editedAd.endDate?.slice(0, 10)}
                      onChange={(e) =>
                        setEditedAd({ ...editedAd, endDate: e.target.value })
                      }
                    />
                  </Form.Group>
                </>
              ) : (
                <>
                  <p>
                    <strong>Description:</strong> {selectedAd.description}
                  </p>
                  <p>
                    <strong>Discount Type:</strong> {selectedAd.discountType}
                  </p>
                  <p>
                    <strong>Discount Value:</strong> {selectedAd.discountValue}
                  </p>
                  <p>
                    <strong>Min Purchase Amount:</strong> ₹
                    {selectedAd.minPurchaseAmount}
                  </p>
                  <p>
                    <strong>Max Discount Amount:</strong> ₹
                    {selectedAd.maxDiscountAmount}
                  </p>
                  <p>
                    <strong>Categories:</strong>{" "}
                    {selectedAd.applicableCategories?.join(", ")}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(selectedAd.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(selectedAd.endDate).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {cookies.role === "admin" && (
            <>
              {isEditing ? (
                <Button
                  variant="success"
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  Save
                </Button>
              ) : (
                <Button variant="primary" onClick={handleEditClick}>
                  Edit
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setSelectedAd(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedAd?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
