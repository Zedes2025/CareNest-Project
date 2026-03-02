import { NavLink, useLocation, useNavigate } from "react-router";
import { useCallback, useMemo } from "react";

//This is all just Placeholder Stuff I asked ChatGPT to use so the Button-logic is already in place
//Login and Register only visible when logged out
//Login turns to Logout when logged in
//Homepage, My Profile and Contacts only visible when logged in
const TOKEN_KEYS = ["authToken", "accessToken", "jwt", "token"] as const;

function getStoredToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const v = localStorage.getItem(key);
    if (v && v.trim().length > 0) return v;
  }
  return null;
}

function clearStoredToken() {
  for (const key of TOKEN_KEYS) localStorage.removeItem(key);
}

function navBtnClass(isActive: boolean) {
  return [
    "btn",
    "btn-ghost",
    "btn-sm",
    "rounded-xl",
    "normal-case",
    "transition-colors",
    "hover:text-blue-50",
    "hover:bg-blue-800",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-blue-600",
    isActive ? "text-blue-600 font-semibold" : "",
  ].join(" ");
}

export const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Re-evaluate on route changes so it updates after login redirects.
  const isAuthenticated = useMemo(() => {
    return Boolean(getStoredToken());
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    // Placeholder logout: remove token(s) and redirect to /login.
    // Anitha: This part can later be replaced with Data Router action + API call.
    clearStoredToken();
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="navbar bg-base-100 border-b border-base-200">
      {/* AI placeholder */}
      <div className="navbar-start">
        <button
          type="button"
          className="btn btn-ghost btn-sm rounded-xl hover:text-blue-600 hover:bg-blue-50"
          aria-label="AI chat placeholder"
          title="AI Chat (placeholder)"
        >
          AI-Chat coming soonTM
        </button>
      </div>

      {/* Center: placeholder text */}
      <div className="navbar-center">
        <span className="text-base font-semibold tracking-wide">
          Connect with your community!
        </span>
      </div>

      {/* Right: navigation buttons */}
      <div className="navbar-end gap-1">
        {isAuthenticated ? (
          <>
            {/* Adjust paths if your router uses different ones */}
            <NavLink
              to="/home"
              className={({ isActive }) => navBtnClass(isActive)}
            >
              Home
            </NavLink>

            <NavLink
              to="/my-profile"
              className={({ isActive }) => navBtnClass(isActive)}
            >
              My Profile
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) => navBtnClass(isActive)}
            >
              Contacts
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => navBtnClass(isActive)}
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) => navBtnClass(isActive)}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
