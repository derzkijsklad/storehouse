/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { login as loginService } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await loginService(username, password);
      sessionStorage.setItem("authToken", token);
      login(token);
      navigate("/orders");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>StoreHouse</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
