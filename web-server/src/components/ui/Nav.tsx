import { NavLink } from "react-router";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { toast } from "react-toastify";
import logo from "../../assets/carenest-logo.png"; // oder .svg

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
  const { signedIn, user, handleSignOut } = useAuth();

  const handleLogout = async () => {
    try {
      await handleSignOut();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Error logging out");
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-start">
        <img src={logo} alt="CareNest" className="h-14 w-auto" />
      </div>

      <div className="navbar-center">
        {signedIn ? (
          <span className="hidden sm:inline text-sm opacity-70">
            Welcome, {user?.firstName}
          </span>
        ) : null}
      </div>

      <div className="navbar-end gap-2">
        {signedIn ? (
          <>
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
              className="btn btn-ghost btn-sm rounded-xl transition-colors hover:text-blue-50 hover:bg-blue-800"
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
