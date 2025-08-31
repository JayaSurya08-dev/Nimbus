import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPas from "./pages/ForgotPas";
import ResetPas from "./pages/ResetPas";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPas />} />
        <Route path="/reset-password/:token" element={<ResetPas />} />
      </Routes>
    </Router>
  );
}

export default App;
