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
  const { cartItems, setCartItems } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [cookies] = useCookies(["email", "role", "userId"]);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!cookies.email;

  // Fetch products by category (men)
  useEffect(() => {
    axios
      .get("http://localhost:3005/api/product", {
        params: { category: "men" }, // <-- sending category as query param
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching men products:", err));
  }, []);

  // Fetch cart & wishlist if authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     axios
  //       .get(`/api/cart/${cookies.userId}`)
  //       .then((res) => setCartItems(res.data.map((item) => item.productId)))
  //       .catch((err) => console.error("Cart fetch error:", err));

  //     axios
  //       .get(`/api/wishlist/${cookies.userId}`)
  //       .then((res) => setWishlistItems(res.data.map((item) => item.productId)))
  //       .catch((err) => console.error("Wishlist fetch error:", err));
  //   }
  // }, [isAuthenticated]);

  const handleRedirectIfNotLoggedIn = () => {
    navigate("/user-login", {
      state: { from: location.pathname },
    });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();

    if (!cartItems.includes(product._id)) {
      try {
        await axios.post(
          "http://localhost:3005/api/user/cart",
          { productId: product._id },
          { withCredentials: true } // ✅ Add this line
        );
        setCartItems([...cartItems, product._id]);
        console.log("✅ Added to cart:", product.name);
      } catch (error) {
        console.error("❌ Cart API Error:", error.message);
      }
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) return handleRedirectIfNotLoggedIn();

    if (!wishlistItems.includes(product._id)) {
      try {
        await axios.post(
          "http://localhost:3005/api/user/wishlist",
          { productId: product._id },
          { withCredentials: true }
        );
        setWishlistItems([...wishlistItems, product._id]);
        console.log("❤️ Added to wishlist:", product.name);
      } catch (error) {
        console.error("❌ Wishlist API Error:", error.message);
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
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-3 v-100">
      <h4 className="mb-3 text-primary fw-bold">Men's Collection</h4>

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
        {products.length === 0 ? (
          <p className="text-muted">No products found.</p>
        ) : (
          products.map((product) => (
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
                      onClick={() => handleAddToCart(product)}
                      disabled={cartItems.includes(product._id)}
                    >
                      <FaShoppingCart className="me-1" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleAddToWishlist(product)}
                      disabled={wishlistItems.includes(product._id)}
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
        <Modal.Body className="d-flex flex-column flex-md-row align-items-center">
          <img
            src={`http://localhost:3005${selectedProduct?.images?.[0]}`}
            alt={selectedProduct?.name}
            className="img-fluid mb-3 mb-md-0"
            style={{ width: "250px", height: "250px", objectFit: "contain" }}
          />
          <div className="ms-md-4">
            <h5 className="text-success mb-2">
              ₹{selectedProduct?.finalPrice || selectedProduct?.price}
            </h5>
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
