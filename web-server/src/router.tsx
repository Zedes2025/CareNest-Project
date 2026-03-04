import { createBrowserRouter, redirect } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./pages/HomePage";
import { ContactPage } from "./pages/ContactPage";
import { DetailsPage } from "./pages/DetailsPage";
import { MyProfilePage } from "./pages/MyProfilePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import ProtectedLayout from "./components/layout/ProtectedLayout";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, loader: () => redirect("/login") },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegistrationPage /> },

      // --- PROTECTED ROUTES SECTION ---
      {
        element: <ProtectedLayout />, // All children here require auth
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/my-profile", element: <MyProfilePage /> },
          { path: "/contact", element: <ContactPage /> },
          { path: "/details/:id", element: <DetailsPage /> },
        ],
      },
    ],
  },
]);
