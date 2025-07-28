import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

export function FitFusionUserForgetPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [isOtpLoading, setIsOtpLoading] = useState(false); // ✅ Spinner state

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setIsOtpLoading(true); // ✅ Start spinner

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
      setIsOtpLoading(false); // ✅ Stop spinner
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter Email");
      return;
    }
    if (!otp || !newPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3005/api/user/resetPassword`,
        {
          email: email,
          otp: otp,
          newPassword: newPassword,
        }
      );

      if (res.data.success) {
        toast.success("Password updated successfully.");
        setTimeout(() => {
          navigate("/login");
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
        <h4 className="mb-3 text-center">Forget Password</h4>
        <form>
          <dl>
            <dt>Email</dt>
            <dd>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </dd>

            <dd>
              <button
                className="btn btn-warning w-100"
                onClick={handleSendOtp}
                disabled={isOtpLoading}
              >
                {isOtpLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Send OTP"
                )}
              </button>
            </dd>

            {otpSent && (
              <>
                <dt>Enter OTP</dt>
                <dd>
                  <input
                    type="text"
                    className="form-control"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </dd>
                <dt>New Password</dt>
                <dd>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </dd>
              </>
            )}
          </dl>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary w-100"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
