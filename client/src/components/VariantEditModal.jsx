import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const sizes = ["S", "M", "L", "XL", "XXL"];

export default function VariantEditModal({
  show,
  onHide,
  productId,
  variant,
  onSave,
}) {
  const [size, setSize] = useState(variant.size);
  const [price, setPrice] = useState(variant.price);
  const [stock, setStock] = useState(variant.stock);
  const [discount, setDiscount] = useState(variant.discount || 0);

  const handleSave = async () => {
    console.log("===", price);
    await axios.patch(
      `http://localhost:3005/api/product/products/${productId}/variant/${variant._id}`,
      {
        updateVariant: {
          size,
          price: Number(price),
          stock: Number(stock),
          discount: Number(discount),
        },
      }
    );

    onSave(); // Refresh list
    onHide(); // Close modal
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Variant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Size</Form.Label>
            <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Select Size</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Discount (%)</Form.Label>
            <Form.Control
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
