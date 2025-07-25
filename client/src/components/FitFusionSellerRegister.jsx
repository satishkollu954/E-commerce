import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import * as yup from "yup";
import axios from "axios";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function FitFusionSellerRegister() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      mobile: "",
      storeName: "",
      gstNumber: "",
      businessAddress: "",
    },
    validationSchema: yup.object({
      name: yup.string().required("Name is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      mobile: yup
        .string()
        .matches(/^\+91\d{10}$/, "Use format: +911234567890")
        .required("Mobile number is required"),
      storeName: yup.string().required("Store name is required"),
      gstNumber: yup.string(),
      businessAddress: yup.string(),
    }),
    onSubmit: (seller) => {
      if (!otpVerified) {
        toast.error("Please verify your email before registering.");
        return;
      }

      const dataToSend = {
        ...seller,
        role: "seller",
      };

      axios
        .post("http://localhost:3005/api/seller/register", dataToSend)
        .then(() => {
          toast.success("Registration successful!");
          navigate("/login");
        })
        .catch((error) => {
          toast.error("Registration failed.");
          console.error(error);
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
    <div className="container py-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Seller Registration</h3>

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
                    formik.touched.name && formik.errors.name
                      ? "is-invalid"
                      : ""
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
                    formik.touched.email && formik.errors.email
                      ? "is-invalid"
                      : ""
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
                  name="mobile"
                  onChange={formik.handleChange}
                  value={formik.values.mobile}
                  className={`form-control ${
                    formik.touched.mobile && formik.errors.mobile
                      ? "is-invalid"
                      : ""
                  }`}
                />
                <div className="invalid-feedback">{formik.errors.mobile}</div>
              </div>

              {/* Store Name */}
              <div className="mb-3">
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  onChange={formik.handleChange}
                  value={formik.values.storeName}
                  className={`form-control ${
                    formik.touched.storeName && formik.errors.storeName
                      ? "is-invalid"
                      : ""
                  }`}
                />
                <div className="invalid-feedback">
                  {formik.errors.storeName}
                </div>
              </div>

              {/* GST Number */}
              <div className="mb-3">
                <label className="form-label">GST Number (Optional)</label>
                <input
                  type="text"
                  name="gstNumber"
                  onChange={formik.handleChange}
                  value={formik.values.gstNumber}
                  className="form-control"
                />
              </div>

              {/* Business Address */}
              <div className="mb-3">
                <label className="form-label">
                  Business Address (Optional)
                </label>
                <textarea
                  name="businessAddress"
                  rows="2"
                  onChange={formik.handleChange}
                  value={formik.values.businessAddress}
                  className="form-control"
                ></textarea>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </div>
            </form>

            <div className="text-center mt-3">
              <span>Already have an account? </span>
              <Link to="/seller-login">
                <strong>Login</strong>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
