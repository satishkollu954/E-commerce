import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Badge } from "react-bootstrap";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";

export function FitFusionShopMen() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cookies] = useCookies(["email"]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("https://fakestoreapi.com/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const isAuthenticated = !!cookies.email;

  const handleRedirectIfNotLoggedIn = () => {
    navigate("/user-login", {
      state: { from: location.pathname },
    });
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      handleRedirectIfNotLoggedIn();
    } else {
      console.log("🛒 Add to cart:", product);
      // Add to cart logic
    }
  };

  const handleAddToWishlist = (product) => {
    if (!isAuthenticated) {
      handleRedirectIfNotLoggedIn();
    } else {
      console.log("❤️ Add to wishlist:", product);
      // Add to wishlist logic
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-3">
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
                  style={{ height: "180px", objectFit: "contain" }}
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
                    >
                      <FaShoppingCart className="me-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleAddToWishlist(product)}
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

      {/* 🔥 Optional: Add subtle hover effect */}
      <style>{`
      .hover-scale:hover {
        transform: scale(1.03);
        transition: transform 0.2s ease-in-out;
      }
    `}</style>
    </div>
  );
}
