import React, { useState } from "react";
import { Button, Container } from "react-bootstrap";
import FitFusionAddProduct from "./FitFusionAddProduct";
import FitFusionViewProducts from "./FitFusionViewProducts";

export function FitFusionSellerDashboard() {
  const [view, setView] = useState("view");

  return (
    <Container>
      <h1 className="text-center my-4">Seller Dashboard</h1>
      <div className="text-center mb-4">
        <Button
          variant="primary"
          onClick={() => setView("add")}
          className="me-2"
        >
          Add Product
        </Button>
        <Button variant="success" onClick={() => setView("view")}>
          View Products
        </Button>
      </div>

      {view === "add" && <FitFusionAddProduct />}
      {view === "view" && <FitFusionViewProducts />}
    </Container>
  );
}
