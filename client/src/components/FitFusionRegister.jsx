import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import * as yup from "yup";
import axios from "axios";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function FitFusionRegister() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
    validationSchema: yup.object({
      name: yup.string().required("Name is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      phone: yup
        .string()
        .matches(/^\+91\d{10}$/, "Use format: +911234567890")
        .required("Mobile number is required"),
    }),
    onSubmit: (user) => {
      if (!otpVerified) {
        toast.error("Please verify your email before registering.");
        return;
      }

      axios
        .post("http://localhost:3005/api/user/register", user)
        .then(() => {
          toast.success("Registration successful!");
          navigate("/login");
        })
        .catch(() => {
          toast.error("Registration failed.");
        });
    },
  });

  const sendOtp = () => {
    if (!formik.values.email || formik.errors.email) {
      toast.error("Enter a valid email first.");
      return;
    }

    axios
      .post("http://localhost:3005/api/otp/send-otp", {
        email: formik.values.email,
      })
      .then(() => {
        toast.success("OTP sent to your email.");
        setOtpSent(true);
      })
      .catch(() => {
        toast.error("Failed to send OTP.");
      });
  };

  const verifyOtp = () => {
    axios
      .post("http://localhost:3005/api/otp/verify-otp", {
        email: formik.values.email,
        otp: otpInput,
      })
      .then(() => {
        toast.success("Email verified!");
        setOtpVerified(true);
      })
      .catch(() => {
        toast.error("Invalid or expired OTP.");
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Create an Account</h3>

        <form onSubmit={formik.handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
              className={`form-control ${
                formik.touched.name && formik.errors.name ? "is-invalid" : ""
              }`}
            />
            <div className="invalid-feedback">{formik.errors.name}</div>
          </div>

          {/* Email & OTP */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              className={`form-control ${
                formik.touched.email && formik.errors.email ? "is-invalid" : ""
              }`}
            />
            <div className="invalid-feedback">{formik.errors.email}</div>

            <div className="mt-2 d-flex gap-2 align-items-center flex-wrap">
              {!otpVerified && (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="btn btn-outline-primary btn-sm"
                  disabled={otpSent}
                >
                  {otpSent ? "OTP Sent" : "Send OTP"}
                </button>
              )}

              {otpSent && !otpVerified && (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="form-control form-control-sm"
                    style={{ maxWidth: "150px" }}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="btn btn-outline-success btn-sm"
                  >
                    Verify
                  </button>
                </>
              )}

              {otpVerified && (
                <span className="badge bg-success">Verified</span>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              className={`form-control ${
                formik.touched.password && formik.errors.password
                  ? "is-invalid"
                  : ""
              }`}
            />
            <div className="invalid-feedback">{formik.errors.password}</div>
          </div>

          {/* Mobile */}
          <div className="mb-3">
            <label className="form-label">Mobile (+91)</label>
            <input
              type="text"
              name="phone"
              onChange={formik.handleChange}
              value={formik.values.phone}
              className={`form-control ${
                formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
              }`}
            />
            <div className="invalid-feedback">{formik.errors.phone}</div>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <span>Already have an account? </span>
          <Link to="/user-login">
            <strong>Login</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
