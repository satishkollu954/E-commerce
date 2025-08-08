import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Badge, Modal } from "react-bootstrap";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./CartContext";
import { ToastContainer, toast } from "react-toastify";

export function FitFusionShopKids() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [currentVariant, setCurrentVariant] = useState(null);

  const { cartItems, setCartItems } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [cookies] = useCookies(["email", "role", "userId"]);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!cookies.email;

  useEffect(() => {
    axios
      .get("http://localhost:3005/api/product/category/child")
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error("Error fetching child products:", err));
  }, []);

  const handleRedirectIfNotLoggedIn = () => {
    navigate("/user-login", { state: { from: location.pathname } });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();
    if (!selectedAgeGroup || !currentVariant)
      return toast.error("Please select an age group before continuing.");

    try {
      // console.log("Adding to cart", product._id, currentVariant._id);
      // console.log("Selected Variant:", currentVariant);

      await axios.post(
        "http://localhost:3005/api/user/cart",
        {
          productId: product._id,
          variantId: currentVariant._id,
        },
        { withCredentials: true }
      );

      setCartItems([...cartItems, product._id]);
      toast.success(`Added to cart (${selectedAgeGroup})`);
      closeModal();
    } catch (error) {
      console.error("❌ Cart API Error:", error.message);
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();
    if (!selectedAgeGroup || !currentVariant) {
      toast.error("Please select an age group before adding to wishlist.");
      return;
    }

    const isAlreadyInWishlist = wishlistItems.some(
      (item) =>
        item.product === product._id && item.variantId === currentVariant._id
    );

    if (!isAlreadyInWishlist) {
      try {
        const res = await axios.post(
          "http://localhost:3005/api/user/wishlist",
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
    setSelectedAgeGroup(""); // start empty
    setCurrentVariant(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSelectedAgeGroup("");
    setCurrentVariant(null);
  };

  const handleAgeGroupChange = (e) => {
    const age = e.target.value;
    setSelectedAgeGroup(age);

    const variant = selectedProduct?.variants.find(
      (v) => v.childAgeGroup === age
    );

    if (variant) {
      const discountAmount = (variant.price * variant.discount) / 100;
      const finalPrice = Math.round(variant.price - discountAmount);

      // Add finalPrice directly to the variant object
      setCurrentVariant({ ...variant, finalPrice });
    } else {
      setCurrentVariant(null);
    }
  };

  const getDefaultVariantPrice = (product) => {
    const sorted = [...product.variants].sort((a, b) =>
      a.childAgeGroup.localeCompare(b.childAgeGroup)
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
      <h4 className="mb-3 text-primary fw-bold">Kid's Collection</h4>

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
                      title="Select age group from modal"
                      onClick={() => openProductModal(product, "wishlist")}
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
          <img
            src={`http://localhost:3005${selectedProduct?.images?.[0]}`}
            alt={selectedProduct?.name}
            className="img-fluid mb-3 mb-md-0"
            style={{ width: "250px", height: "250px", objectFit: "contain" }}
          />
          <div className="ms-md-4 w-100">
            <h5 className="text-success mb-2">
              ₹{currentVariant?.finalPrice ?? "Select Age Group"}
            </h5>

            <p className="text-muted">{selectedProduct?.description}</p>

            <ul className="list-unstyled">
              <li>
                <strong>Category:</strong> {selectedProduct?.category}
              </li>
              <div className="mb-3">
                <label htmlFor="ageGroupSelect" className="form-label">
                  Select Age Group
                </label>
                <select
                  id="ageGroupSelect"
                  className="form-select"
                  value={selectedAgeGroup}
                  onChange={handleAgeGroupChange}
                >
                  <option value="">-- Choose Age Group --</option>

                  {selectedProduct &&
                    [
                      ...new Set(
                        selectedProduct.variants.map(
                          (variant) => variant.childAgeGroup
                        )
                      ),
                    ].map((ageGroup) => (
                      <option key={ageGroup} value={ageGroup}>
                        {ageGroup}
                      </option>
                    ))}
                </select>
              </div>
              {currentVariant && (
                <li>
                  <strong>In Stock:</strong> {currentVariant.stock}
                </li>
              )}
              <li>
                <strong>Delivery Time:</strong> {selectedProduct?.deliveryTime}
              </li>
            </ul>

            <div className="d-flex gap-2 mt-3">
              <Button
                variant="primary"
                onClick={() => handleAddToCart(selectedProduct)}
                disabled={!currentVariant}
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
    </div>
  );
}
