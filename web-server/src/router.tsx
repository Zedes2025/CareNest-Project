import { createBrowserRouter, redirect } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./pages/HomePage";
import { ContactPage } from "./pages/ContactPage";
import { DetailsPage } from "./pages/DetailsPage";
import { MyProfilePage } from "./pages/MyProfilePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, loader: () => redirect("/login") },

      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegistrationPage /> },

      // Keep these routes for layout testing (auth will be wired later)
      { path: "/home", element: <HomePage /> },
      { path: "/my-profile", element: <MyProfilePage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/details/:id", element: <DetailsPage /> },
    ],
  },
]);
