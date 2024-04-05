import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate("/");
  };
  return (
    <div className="flex flex-col items-center gap-6 mt-32">
      <h1 className="text-4xl font-bold text-red">
        Welcome{" "}
        <span className="text-dark">
          {localStorage.getItem("firstName")?.toUpperCase() === "NULL" ? "" : " "}
        </span>
      </h1>
      <div>
        {!localStorage.getItem("token") ? (
          <button
            onClick={() => navigate("/signin")}
            className="hover:bg-red bg-dark text-white rounded-full text-lg font-medium px-8 py-3"
          >
            Log in
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="hover:bg-red bg-dark text-white rounded-full text-lg font-medium px-8 py-3"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
