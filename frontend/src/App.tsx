import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import Home from "./pages/home";
import Signin from "./pages/signin";
import Signup from "./pages/signup";
import Verify from "./pages/verify";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/signin" element={<Signin/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/verify" element={<Verify/>} />
      </Routes>
    </Router>
  );
}

export default App;
