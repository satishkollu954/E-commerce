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

import { FitFusionSellerProfile } from "./components/FitFusionSellerProfile";
import { FitFusionAboutUs } from "./components/FitFusionAboutUs";
import { FitFusionContactUs } from "./components/FitFusionContactUs";
import FitFusionAddProduct from "./components/FitFusionAddProduct";
import FitFusionViewProducts from "./components/FitFusionViewProducts";
import { FitFusionViewAllSellers } from "./components/FitFusionViewAllSellers";
import { FitFusionViewAllUsers } from "./components/FitFusionViewAllUsers";
import { FitFusionViewAllOrders } from "./components/FitFusionViewAllOrders";
import { FitFusionViewProductsBySeller } from "./components/FitFusionViewProductsBySeller";
import { FitFusionSelectedSellerProducts } from "./components/FitFusionSelectedSellerProducts";
import { FitFusionAddAdvertisement } from "./components/FItFusionAddAdvertisement";
import { FitFusionViewQueries } from "./components/FitFusionViewQueires";
import { CheckoutPage } from "./components/CheckoutPage";
import { FitFusionPayment } from "./components/FitFusionPayment";
import { FitFusionUserOrders } from "./components/FitFusionUserOrders";

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
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <FitFusionPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-orders"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <FitFusionUserOrders />
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
            <Route
              path="/user-orders"
              element={
                <ProtectedRoute allowedRoles={["seller"]}>
                  <FitFusionUserOrders />
                </ProtectedRoute>
              }
            />
            <Route path="/men" element={<FitFusionShopMen />} />
            <Route path="/women" element={<FitFusionShopWomen />} />
            <Route path="/kids" element={<FitFusionShopKids />} />
            <Route path="/user-register" element={<FitFusionRegister />} />
            <Route path="/user-login" element={<FitFusionUserLogin />} />
            <Route path="/about-us" element={<FitFusionAboutUs />} />
            <Route path="/contact-us" element={<FitFusionContactUs />} />
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
              path="/view-sellers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionViewAllSellers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-adds"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionAddAdvertisement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-queries"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionViewQueries />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view-users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionViewAllUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionViewAllOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-products"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionViewProductsBySeller />
                </ProtectedRoute>
              }
            />
            <Route
              path="/selected-products"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FitFusionSelectedSellerProducts />
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
              path="/add-product"
              element={
                <ProtectedRoute allowedRoles={["seller"]}>
                  <FitFusionAddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-product"
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
