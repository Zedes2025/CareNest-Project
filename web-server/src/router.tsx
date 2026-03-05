import { createBrowserRouter, redirect } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ContactPage } from "./pages/ContactPage";
import { MyProfilePage } from "./pages/MyProfilePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import { HomePage, homeLoader } from "./pages/HomePage";
import { DetailsPage, detailsLoader } from "./pages/DetailsPage";
import Chat from "./components/Chat";
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
          { path: "/home", element: <HomePage />, loader: homeLoader },
          { path: "/my-profile", element: <MyProfilePage /> },
          { path: "/contact", element: <ContactPage /> },
          {
            path: "/details/:id",
            element: <DetailsPage />,
            loader: detailsLoader,
          },
        ],
      },
    ],
  },
]);
