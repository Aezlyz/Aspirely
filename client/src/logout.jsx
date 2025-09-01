import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";

function Background() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute -top-24 left-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[#2B6CB0]/18 blur-3xl" />
      <div className="absolute -bottom-24 right-[-6rem] h-[32rem] w-[32rem] rounded-full bg-[#F6AD55]/22 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(1100px_480px_at_10%_-20%,rgba(246,173,85,0.14),transparent_60%),radial-gradient(900px_500px_at_90%_-10%,rgba(43,108,176,0.14),transparent_60%)]" />
    </div>
  );
}

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(true);

  function doLogout() {
    try {
      logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-[100vh] pt-24 px-6 relative grid place-items-center" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Background />

      {confirmOpen && (
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white/85 backdrop-blur p-8 shadow-2xl">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#2B6CB0]/10 text-[#2B6CB0] grid place-items-center">
            <i className="ph ph-sign-out text-3xl" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-center">Ready to log out?</h1>
          <p className="text-sm text-gray-600 text-center">You’ll be taken to the login screen.</p>

          <div className="mt-6 flex items-center gap-3 justify-center">
            <button
              onClick={() => (window.history.length > 1 ? history.back() : navigate("/"))}
              className="px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <i className="ph ph-arrow-left" /> Stay here
            </button>
            <button
              onClick={doLogout}
              className="px-5 py-2 rounded-xl bg-[#F6AD55] text-white font-semibold inline-flex items-center gap-2 hover:bg-orange-500"
            >
              <i className="ph ph-check" /> Yes, log me out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
