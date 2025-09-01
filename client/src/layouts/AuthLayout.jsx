// src/layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx"; // if Navbar is at src/Navbar.jsx, change to "../Navbar.jsx"

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-white">
      {/* Global nav should be visible even when logged out */}
      <Navbar />

      {/* Push page content below the fixed navbar (h-16) */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
