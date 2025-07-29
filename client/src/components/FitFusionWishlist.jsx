import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function FitFusionWishlist({ userId }) {
  const [wishlistItems, setWishlistItems] = useState([]);
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
    } catch (error) {
      toast.error("Failed to fetch wishlist");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:3005/api/user/wishlist/${productId}`
      );
      toast.success("Removed from wishlist");
      fetchWishlist(); // refresh
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await axios.post("http://localhost:3005/api/cart", {
        userId,
        productId: product._id,
        quantity: 1,
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Your Wishlist</h3>
      <div className="row">
        {wishlistItems.map((item) => (
          <div className="col-md-4 mb-4" key={item._id}>
            <div className="card h-100">
              <img
                src={item.images[0]}
                alt={item.name}
                className="card-img-top"
                style={{
                  cursor: "pointer",
                  height: "200px",
                  objectFit: "cover",
                }}
                onClick={() => navigate(`/product/${item._id}`)}
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
