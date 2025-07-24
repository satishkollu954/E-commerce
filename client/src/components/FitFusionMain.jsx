import { Link } from "react-router-dom";
import "./FitFusionMain.css";

export function FitFusionMain() {
  return (
    <main className="mt-2">
      <div className="men-fashion">
        <div className="main-title">Men</div>
        <Link to="/men" className="btn btn-light">
          shop Men <span className="bi bi-arrow-right"></span>
        </Link>
      </div>
      <div className="women-fashion">
        <div className="main-title">Women</div>
        <Link to="/women" className="btn btn-light">
          shop Women <span className="bi bi-arrow-right"></span>
        </Link>
      </div>
      <div className="kids-fashion">
        <div className="main-title">Kids</div>
        <Link to="/kids" className="btn btn-light">
          shop Kids <span className="bi bi-arrow-right"></span>
        </Link>
      </div>
    </main>
  );
}
