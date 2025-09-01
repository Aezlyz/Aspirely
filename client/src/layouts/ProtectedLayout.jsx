import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Outlet />
    </div>
  );
}
