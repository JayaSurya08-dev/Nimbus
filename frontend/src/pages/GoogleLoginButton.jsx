// src/components/GoogleLoginButton.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleCallbackResponse = async (response) => {
    const id_token = response.credential;

    try {
      const res = await api.post("auth/google/", { credential: id_token });
      console.log("Google login successful ✅", res.data.user);

      // No localStorage needed — cookies are HttpOnly
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      console.error(
        "Google login failed ❌",
        err.response?.data?.error || err.message
      );
      alert("Google login failed. Please try again.");
    }
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("googleLoginDiv"),
      {
        theme: "filled_blue",
        size: "large",
        shape: "rectangular",
      }
    );

    // Optional: style wrapper for exact size
    const btnDiv = document.getElementById("googleLoginDiv");
    btnDiv.style.width = "312px";
    btnDiv.style.height = "54px";
    btnDiv.style.borderRadius = "7px";
    btnDiv.style.overflow = "hidden";
  }, []);

  return (
    <div
      id="googleLoginDiv"
      style={{
        width: "312px",
        height: "54px",
        borderRadius: "7px",
        overflow: "hidden",
      }}
    ></div>
  );
};

export default GoogleLoginButton;
