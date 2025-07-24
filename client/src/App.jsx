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
import { FitFusionLogin } from "./components/FitFusionLogin";

function App() {
  return (
    <>
      <BrowserRouter>
        <FitFusionHeader />
        <Routes>
          <Route path="/" element={<FitFusionIndex />} />
          <Route path="/cart" element={<FitFusionCart />} />
          <Route path="/wishlist" element={<FitFusionWishlist />} />
          <Route path="/profile" element={<FitFusionProfile />} />
          <Route path="/men" element={<FitFusionShopMen />} />
          <Route path="/women" element={<FitFusionShopWomen />} />
          <Route path="/kids" element={<FitFusionShopKids />} />
          <Route path="/user-register" element={<FitFusionRegister />} />
          <Route path="/login" element={<FitFusionLogin />} />
        </Routes>
        <FitFusionFooter />
      </BrowserRouter>
    </>
  );
}

export default App;
