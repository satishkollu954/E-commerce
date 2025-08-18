import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Badge, Modal } from "react-bootstrap";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./CartContext";
import { ToastContainer, toast } from "react-toastify";

export function FitFusionShopMen() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentVariant, setCurrentVariant] = useState(null);
  const { cartItems, setCartItems } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cookies] = useCookies(["email", "role", "userId"]);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImagePopup, setShowImagePopup] = useState(false);

  const isAuthenticated = !!cookies.email;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (selectedProduct) {
      setCurrentImageIndex(0);
    }
  }, [selectedProduct]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/product/category/men`)
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error("Error fetching men products:", err));
  }, []);

  const handleRedirectIfNotLoggedIn = () => {
    navigate("/user-login", { state: { from: location.pathname } });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();
    if (!selectedSize || !currentVariant)
      return toast.error("Please select a size before continuing.");

    try {
      await axios.post(
        `${API_BASE_URL}/api/user/cart`,
        {
          productId: product._id,
          variantId: currentVariant._id,
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
    if (!selectedSize || !currentVariant)
      return toast.error("Please select a size before continuing.");

    const isAlreadyInWishlist = wishlistItems.some(
      (item) =>
        item.product === product._id && item.variantId === currentVariant._id
    );

    if (!isAlreadyInWishlist) {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/user/wishlist`,
          {
            productId: product._id,
            variantId: currentVariant._id,
          },
          { withCredentials: true }
        );
        setWishlistItems(res.data.wishlist);
        toast.success(`Added to wishlist`);
        closeModal();
      } catch (error) {
        console.error("❌ Wishlist API Error:", error.message);
      }
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setCurrentVariant(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSelectedSize("");
    setCurrentVariant(null);
  };

  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSelectedSize(size);

    const variant = selectedProduct?.variants.find((v) => v.size === size);
    if (variant) {
      const discountAmount = (variant.price * variant.discount) / 100;
      const finalPrice = Math.round(variant.price - discountAmount);
      setCurrentVariant({ ...variant, finalPrice });
    } else {
      setCurrentVariant(null);
    }
  };

  const getDefaultVariantPrice = (product) => {
    const sorted = [...product.variants].sort((a) =>
      a.size.localeCompare(a.size)
    );
    if (!sorted.length) return null;
    const discount = (sorted[0].price * sorted[0].discount) / 100;
    return Math.round(sorted[0].price - discount);
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-3">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
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
                  src={`${API_BASE_URL}${product.images?.[1]}`}
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
                    ₹{getDefaultVariantPrice(product) || "N/A"}
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
                      title="Select size from modal"
                      onClick={() => openProductModal(product)}
                    >
                      <FaHeart />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column flex-md-row align-items-start">
          <div className="position-relative d-flex align-items-center justify-content-center">
            <Button
              variant="light"
              size="sm"
              className="position-absolute start-0 top-50 translate-middle-y bi bi-arrow-left"
              style={{
                zIndex: 2,
                padding: "4px 8px",
                borderRadius: "50%",
                fontSize: "0.8rem",
              }}
              onClick={handlePrevImage}
            ></Button>

            <img
              src={`${API_BASE_URL}${selectedProduct?.images?.[currentImageIndex]}`}
              alt={selectedProduct?.name}
              className="img-fluid mb-3 mb-md-0"
              style={{
                width: "250px",
                height: "250px",
                objectFit: "contain",
                cursor: "pointer",
              }}
              onClick={() => setShowImagePopup(true)}
            />

            <Button
              variant="light"
              size="sm"
              className="position-absolute end-0 top-50 translate-middle-y bi bi-arrow-right"
              style={{
                zIndex: 2,
                padding: "4px 8px",
                borderRadius: "50%",
                fontSize: "0.8rem",
              }}
              onClick={handleNextImage}
            ></Button>
          </div>

          <div className="ms-md-4 w-100">
            <h5
              className={
                currentVariant?.stock === 0
                  ? "text-danger mb-2"
                  : "text-success mb-2"
              }
            >
              {currentVariant
                ? currentVariant.stock === 0
                  ? "Out of Stock"
                  : `₹${currentVariant.finalPrice}`
                : "Select Size"}
            </h5>

            <p className="text-muted">{selectedProduct?.description}</p>

            <ul className="list-unstyled">
              <li>
                <strong>Category:</strong> {selectedProduct?.category}
              </li>
              <div className="mb-3">
                <label htmlFor="sizeSelect" className="form-label">
                  Select Size
                </label>
                <select
                  id="sizeSelect"
                  className="form-select"
                  value={selectedSize}
                  onChange={handleSizeChange}
                >
                  <option value="">-- Choose Size --</option>
                  {selectedProduct &&
                    [
                      ...new Set(
                        selectedProduct.variants.map((variant) => variant.size)
                      ),
                    ].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                </select>
              </div>
              {currentVariant && (
                <>
                  <li>
                    <strong>Original Price:</strong> ₹{currentVariant.price}
                  </li>
                  {currentVariant.discount > 0 && (
                    <li>
                      <strong>Discount:</strong> {currentVariant.discount}% OFF
                    </li>
                  )}
                  <li>
                    <strong>In Stock:</strong> {currentVariant.stock}
                  </li>
                </>
              )}

              <li>
                <strong>Delivery Time:</strong> {selectedProduct?.deliveryTime}
              </li>
            </ul>

            <div className="d-flex gap-2 mt-3">
              <Button
                variant="primary"
                onClick={() => handleAddToCart(selectedProduct)}
                disabled={
                  !currentVariant || currentVariant.stock === 0 // disable if no stock
                }
              >
                <FaShoppingCart className="me-2" />
                Add to Cart
              </Button>
              <Button
                variant="danger"
                onClick={() => handleAddToWishlist(selectedProduct)}
                disabled={
                  !currentVariant ||
                  wishlistItems.some(
                    (item) =>
                      item.product === selectedProduct._id &&
                      item.variantId === currentVariant._id
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

      <Modal
        show={showImagePopup}
        onHide={() => setShowImagePopup(false)}
        centered
        size="me"
      >
        <Modal.Body className="p-0">
          <img
            src={`${API_BASE_URL}${selectedProduct?.images?.[currentImageIndex]}`}
            alt="Large View"
            className="img-fluid w-100"
            style={{ objectFit: "contain" }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}
