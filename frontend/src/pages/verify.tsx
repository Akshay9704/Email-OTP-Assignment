import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from "../urls";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === "") {
      alert("Please enter OTP");
      return;
    }
    if (!/^\d{6}$/g.test(otp)) {
      alert("Please enter a valid OTP (6 digits)");
      return;
    }
    try {
      setLoading(true);
      const data = {
        otp,
        email: location.state.email,
        firstName: location.state.firstName,
        lastName: location.state.lastName,
        password: location.state.password,
      };
      const response = await fetch(`${baseUrl}/api/v1/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        const responseData = await response.json();
        localStorage.setItem("email", responseData.userToken);
        setConfirm(true);
      } else {
        setOtp("");
        setConfirm(false);
        alert(`Verification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-3xl text-dark font-bold">
        An OTP has been sent to your email
      </h1>
      <h5 className="text-xl text-dark font-bold">Please verify</h5>
      <div className="flex flex-col items-center gap-5">
        <input
          className="outline-none border px-3 py-2 rounded-xl mt-5"
          type="text"
          placeholder="Enter OTP here.."
          value={otp}
          onChange={handleOtpChange}
          disabled={loading || confirm}
        />
        {confirm ? (
          <div>
            <p className="text-green-500 text-sm">OTP verified successfully</p>
            <button
              className="bg-red text-white font-bold py-2 px-4 rounded-xl mt-2"
              onClick={() => navigate("/signin")}
            >
              Go to SignIn Page
            </button>
          </div>
        ) : (
          <button
            onClick={registerUser}
            className="bg-red text-white font-bold py-2 px-4 rounded-xl mt-2"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Confirm"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Verify;
