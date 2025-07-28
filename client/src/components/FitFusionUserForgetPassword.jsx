import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

export function FitFusionUserForgetPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setIsOtpLoading(true);

    try {
      await axios.post(`http://localhost:3005/api/otp/send-otp`, {
        email: email,
      });
      toast.success("OTP sent to your email.");
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      await axios.post(`http://localhost:3005/api/otp/verify-otp`, {
        email: email,
        otp: otp,
      });

      toast.success("OTP verified!");
      setOtpVerified(true);
    } catch (error) {
      toast.error("Invalid or expired OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error("Please verify the OTP first.");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3005/api/user/resetPassword`,
        {
          email: email,
          newPassword: newPassword,
        }
      );
      console.log("Response from resetPassword:", res.data);
      if (res.data) {
        toast.success("Password updated successfully.");
        setTimeout(() => {
          navigate("/user-login");
        }, 1000);
      } else {
        toast.error("Invalid OTP or something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to update password.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div
        className="border p-4 rounded shadow w-100"
        style={{ maxWidth: "400px" }}
      >
        <h4 className="mb-3 text-center">Forgot Password</h4>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Send OTP */}
          {!otpVerified && (
            <div className="mb-3 d-flex gap-2">
              <button
                className="btn btn-warning w-100"
                onClick={handleSendOtp}
                disabled={
                  isOtpLoading ||
                  otpSent ||
                  !email ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) // ✅ simple email format check
                }
              >
                {isOtpLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : otpSent ? (
                  "OTP Sent"
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          )}

          {/* OTP Verification */}
          {otpSent && !otpVerified && (
            <div className="mb-3">
              <label>Enter OTP</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleVerifyOtp}
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {otpVerified && (
            <div className="mb-3">
              <span className="badge bg-success">OTP Verified</span>
            </div>
          )}

          {/* New Password */}
          {otpVerified && (
            <div className="mb-3">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={!otpVerified}
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
