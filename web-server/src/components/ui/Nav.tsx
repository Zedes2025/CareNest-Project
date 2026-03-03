import { NavLink } from "react-router";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { toast } from "react-toastify";

function navBtnClass(isActive: boolean) {
  return ["btn", "btn-ghost", "btn-sm", "rounded-xl", "normal-case", "transition-colors", "hover:text-blue-50", "hover:bg-blue-800", "focus-visible:outline", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-blue-600", isActive ? "text-blue-600 font-semibold" : ""].join(" ");
}

export const Nav = () => {
  const { signedIn, user, handleSignOut } = useAuth();
  const handleLogout = async () => {
    console.log("1. Button clicked");
    try {
      await handleSignOut();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error logging out");
      }
    }
  };
  return (
    <div className="navbar bg-base-100 border-b border-base-200">
      {/* AI placeholder */}
      <div className="navbar-start">
        <button type="button" className="btn btn-ghost btn-sm rounded-xl hover:text-blue-600 hover:bg-blue-50" aria-label="AI chat placeholder" title="AI Chat (placeholder)">
          AI-Chat coming soonTM
        </button>
      </div>

      {/* Center: placeholder text */}
      <div className="navbar-center">
        <span className="text-base font-semibold tracking-wide">Connect with your community!</span>
      </div>

      {/* Right: navigation buttons */}
      <div className="navbar-end gap-1">
        {signedIn ? (
          <>
            {/* Adjust paths if your router uses different ones */}
            <p>Welcome back , {user?.firstName}</p>
            <NavLink to="/home" className={({ isActive }) => navBtnClass(isActive)}>
              Home
            </NavLink>

            <NavLink to="/my-profile" className={({ isActive }) => navBtnClass(isActive)}>
              My Profile
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) => navBtnClass(isActive)}>
              Contacts
            </NavLink>

            <NavLink to="/login" onClick={handleLogout} className="btn btn-ghost btn-sm rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50">
              Logout
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => navBtnClass(isActive)}>
              Login
            </NavLink>

            <NavLink to="/register" className={({ isActive }) => navBtnClass(isActive)}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
