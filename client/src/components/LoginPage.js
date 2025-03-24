import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, credentials);
      if (res.data.success) {
        localStorage.setItem("username", credentials.username);
        localStorage.setItem("role", res.data.role);
        navigate("/");
      }
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "linear-gradient(to right, #1e1e1e, #4a4a4a, #bcbcbc)", padding: "20px" }}>
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%", backgroundColor: "#ffffff", borderRadius: "15px", textAlign: "center" }}>
        <h2 className="text-dark mb-4">Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="form-control bg-light text-dark border-secondary rounded-pill p-3"
              required
            />
          </div>
          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="form-control bg-light text-dark border-secondary rounded-pill p-3"
              required
            />
            <span
              className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill shadow fw-bold p-3">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}