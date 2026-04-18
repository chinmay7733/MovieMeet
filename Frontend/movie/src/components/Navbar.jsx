import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { useTheme } from "../context/useTheme";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItemClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? isDark
          ? "bg-white/12 text-white shadow-sm ring-1 ring-white/10"
          : "bg-white text-slate-950 shadow-sm"
        : isDark
          ? "text-white/80 hover:bg-white/10 hover:text-white"
          : "text-slate-600 hover:bg-slate-900/6 hover:text-slate-950"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-xl transition ${
        isDark
          ? "border-white/10 bg-slate-950/80"
          : "border-slate-200/80 bg-white/75"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          to="/"
          className={`flex items-center gap-3 transition ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-lg font-black text-slate-950 shadow-lg shadow-orange-950/20">
            M
          </span>
          <div>
            <p className="text-lg font-black tracking-wide">MovieMeet</p>
            <p
              className={`text-xs uppercase tracking-[0.28em] ${
                isDark ? "text-white/55" : "text-slate-500"
              }`}
            >
              Tickets and Plans
            </p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={navItemClass}>
            Explore
          </NavLink>
          <NavLink to="/dashboard" className={navItemClass}>
            My Space
          </NavLink>
          <NavLink to="/bookings" className={navItemClass}>
            My Bookings
          </NavLink>
          {isAdmin ? (
            <NavLink to="/create" className={navItemClass}>
              Organizer
            </NavLink>
          ) : null}
          <NavLink
            to="/checkout"
            className={navItemClass}
            aria-label="Open checkout cart"
            title="Open checkout cart"
          >
            <span className="relative inline-flex items-center justify-center">
              <span className="sr-only">Checkout Cart</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="9" cy="20" r="1.25" />
                <circle cx="18" cy="20" r="1.25" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h2.2l1.9 9.1a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7.1"
                />
              </svg>
              {totalItems > 0 ? (
                <span className="absolute -right-3 -top-3 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black leading-none text-slate-950">
                  {totalItems}
                </span>
              ) : null}
            </span>
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isDark
                ? "bg-white/8 text-white hover:bg-white/12"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {isDark ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2.5 12h2.2M19.3 12h2.2M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z"
                  />
                </svg>
              )}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </span>
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className={navItemClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  isDark
                    ? "bg-white text-slate-950 hover:bg-amber-100"
                    : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
              >
                Join Now
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
