import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export function ProtectedRoute({ children, allowedRoles }) {
  const [cookies] = useCookies(["email", "role"]);

  const isAuthenticated = cookies.email && cookies.role;
  const userRole = cookies.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect based on user's role if not allowed to access this route
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin-dashboard" />;
      case "seller":
        return <Navigate to="/seller-dashboard" />;
      case "user":
        return <Navigate to="/user-dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
}
