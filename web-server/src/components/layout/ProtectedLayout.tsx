import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedLayout = () => {
  const { signedIn, loading } = useAuth(); // Assuming you exported checkSession as 'loading'

  // 1. If we are still checking the session, show nothing or a spinner
  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  // 2. Only after loading is false, decide where to go
  return signedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedLayout;
