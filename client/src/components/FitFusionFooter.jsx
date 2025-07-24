export function FitFusionFooter() {
  return (
    <footer className="bg-dark text-white mt-2 pt-4">
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Company Info */}
          <div className="col-md-3 mb-3">
            <h5 className="fw-bold">FitFusion</h5>
            <p>
              Your one-stop shop for men, women, and kids' fashion. Trendy.
              Affordable. Reliable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-3 mb-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Shop
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-md-3 mb-3">
            <h6 className="fw-bold">Customer Service</h6>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-3 mb-3">
            <h6 className="fw-bold">Connect With Us</h6>
            <p>
              <i className="bi bi-envelope-fill me-2"></i> support@fitfusion.com
            </p>
            <p>
              <i className="bi bi-telephone-fill me-2"></i> +91-9876543210
            </p>
            <div>
              <i className="bi bi-facebook me-3"></i>
              <i className="bi bi-instagram me-3"></i>
              <i className="bi bi-twitter-x me-3"></i>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-3 border-top border-secondary mt-4">
          <span>© 2023 FitFusion. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
