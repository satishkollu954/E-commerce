import axios from "axios";
import { useState, useEffect } from "react";
import { Table, Button, Form, Pagination, InputGroup } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export function FitFusionViewProductsBySeller() {
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const sellersPerPage = 5;
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch all sellers on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/seller/getallsellers`).then((res) => {
      setSellers(res.data);
    });
  }, []);

  const handleViewProducts = (seller) => {
    navigate("/selected-products", {
      state: { sellerId: seller._id, sellerName: seller.name },
    });
  };

  // Filter sellers by name or email
  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastSeller = currentPage * sellersPerPage;
  const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  const currentSellers = filteredSellers.slice(
    indexOfFirstSeller,
    indexOfLastSeller
  );

  const totalPages = Math.ceil(filteredSellers.length / sellersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-3">
      {/* Search box */}
      <InputGroup className="mb-3 w-50">
        <Form.Control
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
      </InputGroup>

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
          {currentSellers.length > 0 ? (
            currentSellers.map((seller, index) => (
              <tr key={seller._id}>
                <td>{indexOfFirstSeller + index + 1}</td>
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
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No sellers found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          {[...Array(totalPages).keys()].map((num) => (
            <Pagination.Item
              key={num + 1}
              active={num + 1 === currentPage}
              onClick={() => paginate(num + 1)}
            >
              {num + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
}
