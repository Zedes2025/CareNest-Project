import { AuthProvider } from "../../contexts/AuthContext";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Outlet, useNavigation } from "react-router";

export const AppLayout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <AuthProvider>
      <Header />
      <div className="min-h-dvh">
        {isLoading && (
          <div className="container">
            <span className="loading loading-ring loading-xs"></span>
            <span className="loading loading-ring loading-sm"></span>
            <span className="loading loading-ring loading-md"></span>
            <span className="loading loading-ring loading-lg"></span>
            <span className="loading loading-ring loading-xl"></span>
          </div>
        )}
        <Outlet />
      </div>
      <Footer />
    </AuthProvider>
  );
};
