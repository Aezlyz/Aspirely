// Navbar.jsx (hover-enhanced only)
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const NavLink = ({ to = "#", icon, active, children }) => {
  const base =
    "group relative flex items-center gap-2 px-3 py-2 rounded-md " +
    // ↑ original + hover polish:
    "transition-all duration-200 ease-out will-change-transform " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2B6CB0] " +
    "hover:bg-slate-100/70 hover:shadow-[0_4px_16px_rgba(43,108,176,.12)] hover:scale-[1.02]";
  const color = active
    ? "text-[#2B6CB0] font-semibold"
    : "text-gray-700 hover:text-gray-900";
  // underline with a bit more presence + slight gradient on hover
  const underlineCommon =
    "after:content-[''] after:absolute after:left-3 after:right-3 " +
    "after:-bottom-0.5 after:h-0.5 after:rounded-full " +
    "after:bg-[#2B6CB0] after:transition-transform after:duration-200 after:origin-left " +
    "group-hover:after:bg-gradient-to-r group-hover:after:from-[#2B6CB0] group-hover:after:to-sky-400";
  const underlineState = active ? " after:scale-x-100" : " after:scale-x-0 group-hover:after:scale-x-100";

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`${base} ${color} ${underlineCommon} ${underlineState}`}
    >
      {icon ? (
        <i
          className={`ph ${icon} text-[1.15rem] transition-transform duration-200 group-hover:-translate-y-0.5`}
          aria-hidden="true"
        />
      ) : null}
      <span className="leading-none">{children}</span>
    </Link>
  );
};

export default function Navbar() {
  const loc = useLocation();
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Full-width bar; brand stays left; links right */}
      <nav className="w-full h-16 flex items-center px-2 sm:px-3 md:px-4">
        <Link
          to="/"
          className={
            // added only hover feedback—subtle scale + halo; everything else unchanged
            "leading-tight mr-auto rounded-md px-1 transition-all duration-200 " +
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2B6CB0] " +
            "hover:scale-[1.015] hover:bg-slate-50/70 hover:shadow-[0_4px_16px_rgba(43,108,176,.10)]"
          }
        >
          <div className="text-2xl font-bold text-[#2B6CB0] tracking-tight">
            Aspirely
          </div>
          {/* “Careers with Clarity” — same copy; a touch more presence on hover via slight color shift */}
          <div className="text-sm text-[#F6AD55] font-semibold -mt-1 tracking-wide group-hover:text-[#DD6B20] transition-colors duration-200">
            Careers with Clarity
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <NavLink to="/"            icon="ph-house"      active={loc.pathname === "/"}>Home</NavLink>
          <NavLink to="/trending"    icon="ph-trend-up"   active={loc.pathname === "/trending"}>Trending Careers</NavLink>
          <NavLink to="/exam-prep"   icon="ph-book"       active={loc.pathname === "/exam-prep"}>Exam Prep</NavLink>
          <NavLink to="/quiz"        icon="ph-lightbulb"  active={loc.pathname === "/quiz"}>Career Advisor</NavLink>
          <NavLink to="/profile"     icon="ph-user"       active={loc.pathname === "/profile"}>Your Profile</NavLink>
          <NavLink to="/about"       icon="ph-info"       active={loc.pathname === "/about"}>About</NavLink>
          {user ? (
            <NavLink to="/logout"    icon="ph-sign-out"   active={loc.pathname === "/logout"}>Logout</NavLink>
          ) : (
            <NavLink to="/login"     icon="ph-sign-in"    active={loc.pathname === "/login"}>Login</NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
