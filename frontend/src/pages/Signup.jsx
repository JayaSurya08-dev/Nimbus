import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import backgroundImage from "../assets/img2.jpg";

// Enable sending cookies with requests
axios.defaults.withCredentials = true;

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/auth/registration/", {
        username: formData.username,
        email: formData.email,
        password1: formData.password,
        password2: formData.password2,
      });

      // Successful signup, cookies set automatically
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      const errorData = err.response?.data;
      setError(
        errorData?.username?.[0] ||
        errorData?.email?.[0] ||
        errorData?.password1?.[0] ||
        errorData?.non_field_errors?.[0] ||
        "Signup failed"
      );
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
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="password2"
                required
                value={formData.password2}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            <button
              type="button"
              style={{
                marginTop: "0.7rem",
                background: "#e0e7ff",
                color: "#242424",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
