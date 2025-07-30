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
      setWishlistItems(res.data.wishlist); // ✅ fix here
      console.log("Fetched wishlist:", res.data.wishlist);
    } catch (error) {
      toast.error("Failed to fetch wishlist");
    }
  };

  const handleRemove = async (productId, size) => {
    try {
      const res = await axios.delete(
        `http://localhost:3005/api/user/wishlist/${productId}/${size}`,
        { withCredentials: true }
      );
      setWishlistItems(res.data.wishlist); // Or re-fetch if needed
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error removing item from wishlist");
    }
  };

  const handleAddToCart = async (item) => {
    const { product, size } = item;

    const isAlreadyInCart = cartItems.includes(product._id);

    if (!isAlreadyInCart) {
      try {
        await axios.post(
          "http://localhost:3005/api/user/cart",
          { productId: product._id, size, quantity: 1 }, // ✅ Pass correct size
          { withCredentials: true }
        );
        setCartItems([...cartItems, product._id]);
        handleRemove(item.product._id, size); // optionally remove from wishlist
        toast.success("Added to cart");
      } catch (error) {
        console.error("❌ Cart API Error:", error.message);
        toast.error("Failed to add to cart");
      }
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
                src={`http://localhost:3005${item.product?.images?.[0]}`}
                alt={item.product?.name}
                className="card-img-top"
                style={{
                  cursor: "pointer",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{item.product?.name}</h5>
                <p className="card-text">₹{item.product?.price}</p>
                <p className="card-text">Size: {item.size}</p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(item.product._id, item.size)}
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
