import { Link } from "react-router-dom";
import "./FitFusionMain.css";

export function FitFusionMain() {
  return (
    <main className="mt-1">
      <div className="men-fashion fashion-card">
        <Link to="/men" className="fashion-overlay"></Link>
        <div className="main-title">Men</div>
        <Link to="/men" className="btn btn-light">
          Shop Men <span className="bi bi-arrow-right"></span>
        </Link>
      </div>

      <div className="women-fashion fashion-card">
        <Link to="/women" className="fashion-overlay"></Link>
        <div className="main-title">Women</div>
        <Link to="/women" className="btn btn-light">
          Shop Women <span className="bi bi-arrow-right"></span>
        </Link>
      </div>

      <div className="kids-fashion fashion-card">
        <Link to="/kids" className="fashion-overlay"></Link>
        <div className="main-title">Kids</div>
        <Link to="/kids" className="btn btn-light">
          Shop Kids <span className="bi bi-arrow-right"></span>
        </Link>
      </div>
    </main>
  );
}
