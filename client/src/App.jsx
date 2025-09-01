import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";

import ProtectedLayout from "./layouts/ProtectedLayout.jsx";

import Home from "./home.jsx";
import Quiz from "./quiz.jsx";
import Trending from "./trending.jsx";
import ExamPrep from "./ExamPrep.jsx";
import About from "./about.jsx";
import Profile from "./profile.jsx";

import Login from "./login.jsx";
import Signup from "./signup.jsx";
import Logout from "./logout.jsx";
import Forgot from "./forgot.jsx"; // ✅ NEW

function Splash() {
  return (
    <main className="min-h-screen grid place-items-center">
      <div className="flex items-center gap-3 text-slate-600">
        <div className="h-3 w-3 rounded-full bg-[#2B6CB0] animate-bounce" />
        <div className="h-3 w-3 rounded-full bg-[#2B6CB0]/70 animate-bounce [animation-delay:.12s]" />
        <div className="h-3 w-3 rounded-full bg-[#2B6CB0]/50 animate-bounce [animation-delay:.24s]" />
        <span className="ml-2 font-medium">Loading…</span>
      </div>
    </main>
  );
}

function AuthGateLayout() {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  if (loading && token) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <ProtectedLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC (no navbar) */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} /> {/* ✅ NEW */}
          <Route path="/logout" element={<Logout />} />

          {/* PROTECTED (with navbar) */}
          <Route element={<AuthGateLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/exam-prep" element={<ExamPrep />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
