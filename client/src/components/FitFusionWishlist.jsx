import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext";

export function FitFusionWishlist({ userId }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { cartItems, setCartItems } = useContext(CartContext);
  const navigate = useNavigate();

  // Fetch wishlist on component load
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`http://localhost:3005/api/user/wishlist`, {
        withCredentials: true,
      });
      setWishlistItems(res.data);
      console.log("Fetched wishlist:", res.data);
    } catch (error) {
      toast.error("Failed to fetch wishlist");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:3005/api/user/wishlist/${productId}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Removed from wishlist");
      fetchWishlist(); // refresh
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (product) => {
    //if (!isAuthenticated) return handleRedirectIfNotLoggedIn();

    if (!cartItems.includes(product._id)) {
      try {
        await axios.post(
          "http://localhost:3005/api/user/cart",
          { productId: product._id },
          { withCredentials: true } // ✅ Add this line
        );
        setCartItems([...cartItems, product._id]);
        console.log("✅ Added to cart:", product.name);
        handleRemove(product._id); // Remove from wishlist after adding to cart
      } catch (error) {
        console.error("❌ Cart API Error:", error.message);
      }
    }
  };

  return (
    <div className="container mt-4 vh-100">
      <h3>Your Wishlist</h3>
      <div className="row">
        {wishlistItems.map((item) => (
          <div className="col-md-4 mb-4" key={item._id}>
            <div className="card h-100">
              <img
                src={`http://localhost:3005${item.images?.[0]}`}
                alt={item.name}
                className="card-img-top"
                style={{
                  cursor: "pointer",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">₹{item.price}</p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {wishlistItems.length === 0 && (
          <p className="text-muted">Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
}
