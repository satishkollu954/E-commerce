import axios from "axios";
import { useFormik } from "formik";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";

export function FitFusionUserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies(["email", "role", "userId"]);

  // If redirected from another route, this will hold that pathname
  const from = location.state?.from || "/";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object({
      email: yup.string().required("Email is required"),
      password: yup.string().required("Password is required"),
    }),
    onSubmit: (user) => {
      axios
        .post(`${API_BASE_URL}/api/user/login`, user)
        .then((response) => {
          const { email, role, _id } = response.data.user;
          setCookie("email", email);
          setCookie("role", role);
          setCookie("userId", _id);
          toast.success("Login successful");

          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        })
        .catch(() => {
          toast.error("Login failed");
        });
    },
  });

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white shadow p-4 rounded"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">User Login</h3>

        <div className="mb-3">
          <label className="form-label">Email Id</label>
          <input
            type="text"
            name="email"
            className={`form-control ${
              formik.touched.email && formik.errors.email ? "is-invalid" : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger">{formik.errors.email}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className={`form-control ${
              formik.touched.password && formik.errors.password
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-danger">{formik.errors.password}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">
          Login
        </button>

        <div className="text-center">
          <Link to="/user-register" className="text-decoration-none">
            New User? <strong>Register</strong>
          </Link>
          <br />
          <Link to="/user-forget" className="text-decoration-none">
            <strong>Forget Password</strong>
          </Link>
        </div>
      </form>
    </div>
  );
}
