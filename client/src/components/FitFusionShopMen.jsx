import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Badge, Modal } from "react-bootstrap";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./CartContext";

export function FitFusionShopMen() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const { cartItems, setCartItems } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [cookies] = useCookies(["email", "role", "userId"]);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!cookies.email;

  useEffect(() => {
    axios
      .get("http://localhost:3005/api/product", {
        params: { category: "men" },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching men products:", err));
  }, []);

  const handleRedirectIfNotLoggedIn = () => {
    navigate("/user-login", {
      state: { from: location.pathname },
    });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();

    if (!selectedSize) {
      return alert("Please select a size before adding to cart.");
    }

    try {
      await axios.post(
        "http://localhost:3005/api/user/cart",
        {
          productId: product._id,
          size: selectedSize,
        },
        { withCredentials: true }
      );
      setCartItems([...cartItems, product._id]);
      toast.success(`Added to cart (${selectedSize})`);
      closeModal();
    } catch (error) {
      console.error("❌ Cart API Error:", error.message);
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();

    if (!selectedSize) {
      return alert("Please select a size before adding to wishlist.");
    }

    const isAlreadyInWishlist = wishlistItems.some(
      (item) => item.product === product._id
    );

    if (!isAlreadyInWishlist) {
      try {
        const res = await axios.post(
          "http://localhost:3005/api/user/wishlist",
          { productId: product._id, size: selectedSize },
          { withCredentials: true }
        );
        setWishlistItems(res.data.wishlist); // ✅ update from backend
        toast.success(`Added to wishlist (${selectedSize})`);
      } catch (error) {
        console.error("❌ Wishlist API Error:", error.message);
      }
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSelectedSize("");
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-3" style={{ height: "100vh" }}>
      <h4 className="mb-3 text-primary fw-bold">Men's Collection</h4>

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded shadow-sm"
        />
      </InputGroup>

      <div className="row">
        {filteredProducts.length === 0 ? (
          <p className="text-muted">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div className="col-6 col-sm-4 col-md-3 mb-4" key={product._id}>
              <Card className="h-100 shadow-sm border-0 rounded-3 hover-scale">
                <Card.Img
                  variant="top"
                  src={`http://localhost:3005${product.images?.[0]}`}
                  alt={product.name}
                  style={{
                    height: "180px",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                  onClick={() => openProductModal(product)}
                />
                <Card.Body className="d-flex flex-column justify-content-between">
                  <Card.Title
                    className="fs-6 text-truncate"
                    title={product.name}
                  >
                    {product.name}
                  </Card.Title>
                  <Badge bg="success" className="mb-2 fs-6">
                    ₹{product.finalPrice || product.price}
                  </Badge>

                  <div className="d-flex justify-content-between">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => openProductModal(product)}
                    >
                      <FaShoppingCart className="me-1" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleAddToWishlist(product)}
                      disabled={wishlistItems.some(
                        (item) => item.product === product._id
                      )}
                    >
                      <FaHeart className="me-1" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* 📦 Modal for Product Details */}
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column flex-md-row align-items-start">
          <img
            src={`http://localhost:3005${selectedProduct?.images?.[0]}`}
            alt={selectedProduct?.name}
            className="img-fluid mb-3 mb-md-0"
            style={{ width: "250px", height: "250px", objectFit: "contain" }}
          />
          <div className="ms-md-4 w-100">
            <h5 className="text-success mb-2">
              ₹{selectedProduct?.finalPrice || selectedProduct?.price}
            </h5>
            <p className="text-muted">{selectedProduct?.description}</p>

            {/* Size Selection */}
            {selectedProduct?.sizes?.length > 0 && (
              <div className="mb-3">
                <label htmlFor="sizeSelect" className="form-label">
                  Select Size
                </label>
                <select
                  id="sizeSelect"
                  className="form-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">-- Choose Size --</option>
                  {selectedProduct.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Product Details */}
            <ul className="list-unstyled">
              <li>
                <strong>Category:</strong> {selectedProduct?.category}
              </li>
              {selectedProduct?.category === "child" && (
                <li>
                  <strong>Age Group:</strong> {selectedProduct?.childAgeGroup}
                </li>
              )}
              {/* <li>
                <strong>SKU:</strong> {selectedProduct?.sku}
              </li> */}
              {/* <li>
                <strong>Colors:</strong>{" "}
                {selectedProduct?.colors?.length > 0
                  ? selectedProduct.colors.join(", ")
                  : "N/A"}
              </li> */}
              <li>
                <strong>In Stock:</strong> {selectedProduct?.stockQuantity}
              </li>
              <li>
                <strong>Shipping Charge:</strong> ₹
                {selectedProduct?.shippingCharge}
              </li>
              <li>
                <strong>Delivery Time:</strong> {selectedProduct?.deliveryTime}
              </li>
              <li>
                <strong>Tags:</strong>{" "}
                {selectedProduct?.tags?.length > 0
                  ? selectedProduct.tags.join(", ")
                  : "None"}
              </li>
              <li>
                <strong>Meta Title:</strong>{" "}
                {selectedProduct?.metaTitle || "N/A"}
              </li>
              <li>
                <strong>Meta Description:</strong>{" "}
                {selectedProduct?.metaDescription || "N/A"}
              </li>
            </ul>

            {/* Buttons */}
            <div className="d-flex gap-2 mt-3">
              <Button
                variant="primary"
                onClick={() => handleAddToCart(selectedProduct)}
              >
                <FaShoppingCart className="me-2" />
                Add to Cart
              </Button>
              <Button
                variant="danger"
                onClick={() => handleAddToWishlist(selectedProduct)}
                disabled={
                  !selectedProduct ||
                  wishlistItems.some(
                    (item) => item.product === selectedProduct._id
                  )
                }
              >
                <FaHeart className="me-2" />
                Add to Wishlist
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .hover-scale:hover {
          transform: scale(1.03);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
