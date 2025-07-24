import { useState } from "react";
import "./FitFusionHeader.css"; // custom CSS
import { Link } from "react-router-dom";

export function FitFusionHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen);

  return (
    <header className="container-fluid bg-white shadow-sm">
      <nav className="navbar navbar-expand-md container-fluid p-2">
        {/* Logo and Toggler */}
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

        {/* Nav and Icons Section */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <div className="d-md-flex w-100 justify-content-between align-items-center text-center">
            {/* Centered Nav Links */}
            <ul className="navbar-nav mx-auto mb-2 mb-md-0">
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="#">
                  Pages
                </Link>
              </li>
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="#">
                  Docs
                </Link>
              </li>
              <li className="nav-item mx-2 fs-5">
                <Link className="nav-link" to="#">
                  Blog
                </Link>
              </li>
            </ul>

            {/* Right-aligned Icons */}
            <div className="d-flex justify-content-center justify-content-md-end fs-5 icon-group mt-2 mt-md-0">
              <Link to="/wishlist" className="text-dark mx-2">
                <i className="bi bi-heart-fill"></i>
              </Link>
              <Link to="/user-register" className="text-dark mx-2">
                <i className="bi bi-person-fill"></i>
              </Link>
              <Link to="/cart" className="text-dark mx-2 position-relative">
                <i className="bi bi-cart-fill"></i>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
