import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { CookiesProvider } from "react-cookie";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </StrictMode>
);
