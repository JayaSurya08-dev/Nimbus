import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleCallbackResponse = async (response) => {
    const id_token = response.credential;
    try {
      const res = await axios.post("http://localhost:8000/api/auth/google/", {
        credential: id_token,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

      console.log("Login successful ✅", res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed ❌", err.response?.data || err);
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

    // Style wrapper for exact size
    const btnDiv = document.getElementById("googleLoginDiv");
    btnDiv.style.width = "312px";
    btnDiv.style.height = "54px";
    btnDiv.style.borderRadius = "7px";
    btnDiv.style.overflow = "hidden"; // ensure corners stay rounded
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
