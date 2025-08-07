import "./App.css";
import { FitFusionIndex } from "./components/FitFusionIndex";
import { FitFusionHeader } from "./components/FitFusionHeader";
import { FitFusionFooter } from "./components/FitFusionFooter";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FitFusionCart } from "./components/FitFusionCart";
import { FitFusionWishlist } from "./components/FitFusionWishlist";
import { FitFusionUserProfile } from "./components/FitFusionUserProfile";
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
import { FitFusionUserForgetPassword } from "./components/FitFusionUserForgetPassword";
import { FitFusionSellerForgetPassword } from "./components/FitFusionSellerForgetPassword";
import FitFusionAddProduct from "./components/FitFusionAddProducts";
import FitFusionViewProducts from "./components/FitFusionViewProducts";
import { FitFusionSellerProfile } from "./components/FitFusionSellerProfile";
import { FitFusionAboutUs } from "./components/FitFusionAboutUs";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <FitFusionHeader />
        <div className="main-content">
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
              path="/user-profile"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <FitFusionUserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller-profile"
              element={
                <ProtectedRoute allowedRoles={["seller"]}>
                  <FitFusionSellerProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/men" element={<FitFusionShopMen />} />
            <Route path="/women" element={<FitFusionShopWomen />} />
            <Route path="/kids" element={<FitFusionShopKids />} />
            <Route path="/user-register" element={<FitFusionRegister />} />
            <Route path="/user-login" element={<FitFusionUserLogin />} />
            <Route path="/about-us" element={<FitFusionAboutUs />} />
            <Route
              path="/user-forget"
              element={<FitFusionUserForgetPassword />}
            />
            <Route
              path="/seller-forget"
              element={<FitFusionSellerForgetPassword />}
            />
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
            <Route
              path="/seller-Addproducts"
              element={
                <ProtectedRoute allowedRoles={["seller"]}>
                  <FitFusionAddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller-viewproducts"
              element={
                <ProtectedRoute allowedRoles={["seller"]}>
                  <FitFusionViewProducts />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <FitFusionFooter />
      </BrowserRouter>
    </div>
  );
}

export default App;
