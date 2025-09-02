import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';
import backgroundImage from "../assets/img2.jpg";
import GoogleLoginButton from "./GoogleLoginButton"; // Make sure this component is implemented

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      navigate("/dashboard"); // Redirect after login
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div
        className="image-side"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      <div className="form-side">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <a href="/forgot-password"style={{color: "rgba(255, 255, 255, 0.9)",
              fontWeight:"600",
              fontSize:"0.9rem",
              textShadow:" 0 1px 3px rgba(220, 38, 38, 0.3)"}} >Forgot Password?</a>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              style={{ marginTop: "0.7rem", background: "#e0e7ff", color: "#242424" }}
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </form>

          {/* Google login placed here */}
          <div style={{ marginTop: "1.5rem" }}>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
