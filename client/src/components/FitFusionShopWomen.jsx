import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Badge, Modal } from "react-bootstrap";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./CartContext";

export function FitFusionShopWomen() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // For modal
  const [showModal, setShowModal] = useState(false);
  const { cartItems, setCartItems } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [cookies] = useCookies(["email", "role", "userId"]);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!cookies.email;

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get(`/api/cart/${cookies.userId}`)
        .then((res) => setCartItems(res.data.map((item) => item.productId)))
        .catch((err) => console.error("Cart fetch error:", err));

      axios
        .get(`/api/wishlist/${cookies.userId}`)
        .then((res) => setWishlistItems(res.data.map((item) => item.productId)))
        .catch((err) => console.error("Wishlist fetch error:", err));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    axios
      .get("https://fakestoreapi.com/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleRedirectIfNotLoggedIn = () => {
    navigate("/user-login", {
      state: { from: location.pathname },
    });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      handleRedirectIfNotLoggedIn();
    } else {
      if (!cartItems.includes(product.id)) {
        try {
          await axios.post("/api/cart/add", {
            // userId: cookies.userId,
            // email: cookies.email,
            productId: product.id,
          });
          setCartItems([...cartItems, product.id]);
          console.log("✅ Added to cart:", product.title);
        } catch (error) {
          console.error("❌ Cart API Error:", error.message);
        }
      }
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) {
      handleRedirectIfNotLoggedIn();
    } else {
      if (!wishlistItems.includes(product.id)) {
        try {
          await axios.post("/api/wishlist/add", {
            // userId: cookies.userId,
            // email: cookies.email,
            productId: product.id,
          });
          setWishlistItems([...wishlistItems, product.id]);
          console.log("❤️ Added to wishlist:", product.title);
        } catch (error) {
          console.error("❌ Wishlist API Error:", error.message);
        }
      }
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-3">
      <h4 className="mb-3 text-primary fw-bold">Women's Collection</h4>

      {/* 🔍 Search Bar */}
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
            <div className="col-6 col-sm-4 col-md-3 mb-4" key={product.id}>
              <Card className="h-100 shadow-sm border-0 rounded-3 hover-scale">
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.title}
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
                    title={product.title}
                  >
                    {product.title}
                  </Card.Title>
                  <Badge bg="success" className="mb-2 fs-6">
                    ₹{product.price}
                  </Badge>

                  <div className="d-flex justify-content-between">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleAddToCart(product)}
                      disabled={cartItems.includes(product.id)}
                    >
                      <FaShoppingCart className="me-1" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleAddToWishlist(product)}
                      disabled={wishlistItems.includes(product.id)}
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
          <Modal.Title>{selectedProduct?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column flex-md-row align-items-center">
          <img
            src={selectedProduct?.image}
            alt={selectedProduct?.title}
            className="img-fluid mb-3 mb-md-0"
            style={{ width: "250px", height: "250px", objectFit: "contain" }}
          />
          <div className="ms-md-4">
            <h5 className="text-success mb-2">₹{selectedProduct?.price}</h5>
            <p className="text-muted">{selectedProduct?.description}</p>
            <div className="d-flex gap-2">
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
