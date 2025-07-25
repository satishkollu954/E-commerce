import "./App.css";
import { FitFusionIndex } from "./components/FitFusionIndex";
import { FitFusionHeader } from "./components/FitFusionHeader";
import { FitFusionFooter } from "./components/FitFusionFooter";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FitFusionCart } from "./components/FitFusionCart";
import { FitFusionWishlist } from "./components/FitFusionWishlist";
import { FitFusionProfile } from "./components/FitFusionProfile";
import { FitFusionShopMen } from "./components/FitFusionShopMen";
import { FitFusionShopWomen } from "./components/FitFusionShopWomen";
import { FitFusionShopKids } from "./components/FitFusionShopKids";
import { FitFusionRegister } from "./components/FitFusionRegister";
import { FitFusionUserLogin } from "./components/FitFusionUserLogin";
import { ProtectedRoute } from "./components/FitFusionProtectRoutes";
import { FitFusionAdminDashboard } from "./components/FitFusionAdminDashboard";
import { FitFusionSellerDashboard } from "./components/FitFusionSellerDashboard";
import { FitFusionSellerLogin } from "./components/FitFusionSellerLogin";
import { FitFusionSellerRegister } from "./components/FitFusionSellerRegister";

function App() {
  return (
    <>
      <BrowserRouter>
        <FitFusionHeader />
        <Routes>
          <Route path="/" element={<FitFusionIndex />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <FitFusionCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <FitFusionWishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
                <FitFusionProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/men" element={<FitFusionShopMen />} />
          <Route path="/women" element={<FitFusionShopWomen />} />
          <Route path="/kids" element={<FitFusionShopKids />} />
          <Route path="/user-register" element={<FitFusionRegister />} />
          <Route path="/user-login" element={<FitFusionUserLogin />} />
          <Route
            path="/seller-register"
            element={<FitFusionSellerRegister />}
          />
          <Route path="/seller-login" element={<FitFusionSellerLogin />} />

          {/* Dashboards */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FitFusionAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <FitFusionSellerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <FitFusionFooter />
      </BrowserRouter>
    </>
  );
}

export default App;
