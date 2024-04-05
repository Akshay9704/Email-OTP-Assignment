import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from "../urls";

const Verify = () => {
  const [otp, setOtp] = React.useState("");

  const location = useLocation();

  const navigate = useNavigate();

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === "") {
      alert("Please enter OTP");
    } else if (!/[^a-zA-Z]/.test(otp)) {
      alert("Please enter valid OTP");
    } else {
      const data = {
        otp,
        email: location.state && location.state.email,
      };
      const response = await fetch(`${baseUrl}/api/v1/users/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        const responseData = await response.json();
        localStorage.setItem("email", responseData.userToken);
        alert("User is verified successfully");
        navigate("/signin");
      } else {
        alert("Verification failed. Please try again");
        navigate("/verify")
      }
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-3xl text-dark font-bold">
        An OTP is sent to your mail id
      </h1>
      <h5 className="text-xl text-dark font-bold">Please verify</h5>
      <div className="flex flex-col items-center gap-5">
        <input
          className="outline-none border px-3 py-2 rounded-xl mt-5"
          type="text"
          placeholder="Enter OTP here.."
          value={otp}
          onChange={handleOtpChange}
        />
        <button
          onClick={(e) => {
            registerUser(e);
            navigate("/signin");
          }}
          className="bg-red text-white font-bold py-2 px-4 rounded-xl mt-2"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default Verify;
