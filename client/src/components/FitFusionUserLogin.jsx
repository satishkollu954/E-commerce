import axios from "axios";
import { useFormik } from "formik";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function FitFusionUserLogin() {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["email", "role"]);

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
        .post("http://localhost:3005/api/user/login", user)
        .then((response) => {
          const { email, role } = response.data.user;
          setCookie("email", email);
          setCookie("role", role);
          toast.success("Login successful");
          navigate("/");
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
        </div>
      </form>
    </div>
  );
}
