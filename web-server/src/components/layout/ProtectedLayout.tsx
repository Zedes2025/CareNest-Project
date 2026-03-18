// import { Outlet, Navigate } from "react-router";
// import { useAuth } from "../../contexts/AuthContext";

// const ProtectedLayout = () => {
//   const { user, loading } = useAuth(); // Assuming you exported checkSession as 'loading'

//   // 1. If we are still checking the session, show nothing or a spinner
//   if (loading) {
//     return <span className="loading loading-spinner loading-lg"></span>;
//   }

//   // 2. Only after loading is false, decide where to go
//   return user ? <Outlet /> : <Navigate to="/login" replace={true} />;
// };

// export default ProtectedLayout;

import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import homeBg from "../../assets/home-bg.jpg";

const ProtectedLayout = () => {
  const { signedIn, loading } = useAuth();

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!signedIn) return <Navigate to="/login" replace />;

  return (
    <div
      className="flex-1 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homeBg})` }}
    >
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
