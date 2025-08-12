import axios from "axios";
import { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { FitFusionSelectedSellerProducts } from "./FitFusionSelectedSellerProducts";
import { Navigate, useNavigate } from "react-router-dom";

export function FitFusionViewProductsBySeller() {
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const navigate = useNavigate();

  // Fetch all sellers on mount
  useEffect(() => {
    axios.get("http://localhost:3005/api/seller/getallsellers").then((res) => {
      setSellers(res.data);
    });
  }, []);

  const handleViewProducts = (seller) => {
    navigate("/selected-products", {
      state: { sellerId: seller._id, sellerName: seller.name }, // passing sellerId as state
    }); // send this ID as props
  };

  return (
    <div className="p-3">
      <h4>All Sellers with Products</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Seller Name</th>
            <th>Email</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((seller, index) => (
            <tr key={seller._id}>
              <td>{index + 1}</td>
              <td>{seller.name}</td>
              <td>{seller.email}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleViewProducts(seller)}
                >
                  <FaEye /> View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
