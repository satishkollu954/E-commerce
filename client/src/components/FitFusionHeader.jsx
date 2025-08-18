import { useState, useEffect, useRef, useContext } from "react";
import "./FitFusionHeader.css";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { CartContext } from "./CartContext";

export function FitFusionHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [cookies, , removeCookie] = useCookies(["email", "role"]);
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

  const role = cookies.role;
  const isLoggedIn = role === "user" || role === "seller" || role === "admin";

  const toggleNavbar = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleLogout = () => {
    removeCookie("email");
    removeCookie("role");
    navigate("/");
    window.location.reload(); // optional: refresh state
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="container-fluid bg-white shadow-sm">
      <nav className="navbar navbar-expand-md container-fluid p-2">
        <div className="d-flex align-items-center w-100 justify-content-between">
          <div className="fs-4 fw-bold">FitFusion.</div>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleNavbar}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <div className="d-md-flex w-100 justify-content-between align-items-center text-center">
            <ul className="navbar-nav mx-auto mb-2 mb-md-0">
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="/about-us">
                  AboutUs
                </Link>
              </li>
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="#">
                  Docs
                </Link>
              </li>
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="/contact-us">
                  Contact
                </Link>
              </li>
              {role === "admin" && (
                <li className="nav-item mx-2 fs-5">
                  <Link className="nav-link" to="/admin-dashboard">
                    Dashboard
                  </Link>
                </li>
              )}

              {role === "seller" && (
                <li className="nav-item mx-2 fs-5">
                  <Link className="nav-link" to="/seller-dashboard">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>

            <div className="d-flex flex-nowrap justify-content-center justify-content-md-end align-items-center fs-5 icon-group mt-2 mt-md-0">
              {/* Wishlist & Cart for User only */}
              {cookies.role === "user" && (
                <>
                  <Link to="/wishlist" className="text-dark mx-2">
                    <i className="bi bi-heart-fill"></i>
                  </Link>
                  <Link to="/cart" className="text-dark mx-2 position-relative">
                    <i className="bi bi-cart-fill"></i>
                    {cartItems.length > 0 && (
                      <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Default Login Icon if not logged in */}
              {!isLoggedIn && (
                <Link to="/user-login" className="text-dark mx-2">
                  <i className="bi bi-person-fill"></i>
                </Link>
              )}

              {/* Profile Dropdown if logged in */}
              {isLoggedIn && (
                <div
                  className="position-relative mx-2 dropdown-wrapper"
                  ref={dropdownRef}
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: "35px", height: "35px", cursor: "pointer" }}
                    onClick={toggleDropdown}
                  >
                    <span className="fw-bold">
                      {cookies.email
                        ? cookies.email.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  </div>

                  <div
                    className={`dropdown-menu-custom position-absolute end-0 bg-white border rounded shadow p-2 mt-2 ${
                      showDropdown ? "show" : ""
                    }`}
                  >
                    {(cookies.role === "user" || cookies.role === "seller") && (
                      <Link
                        to={
                          cookies.role === "seller"
                            ? "/seller-profile"
                            : "/user-profile"
                        }
                        className="dropdown-item-custom"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                    )}

                    {/* ✅ Only show Orders if role is user */}
                    {cookies.role === "user" && (
                      <Link
                        to="/user-orders"
                        className="dropdown-item-custom"
                        onClick={() => setShowDropdown(false)}
                      >
                        My Orders
                      </Link>
                    )}

                    <div
                      className="dropdown-item-custom text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </div>
                  </div>
                </div>
              )}

              {/* Become a Seller - only visible when not logged in */}
              {!isLoggedIn && (
                <Link
                  to="/seller-register"
                  className="btn btn-outline-primary mx-2"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Become a Seller
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
