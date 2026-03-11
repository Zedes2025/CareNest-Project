import { createBrowserRouter, redirect } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ContactPage, connectionLoader } from "./pages/ContactPage";
import { MyProfilePage } from "./pages/MyProfilePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import { HomePage, homeLoader } from "./pages/HomePage";
import { Documents } from "./pages/DocumentPage";
import { DetailsPage, detailsLoader } from "./pages/DetailsPage";
import ErrorPage from "./pages/ErrorPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <div>Loading...</div>,
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
          {
            path: "/contact",
            element: <ContactPage />,
            loader: connectionLoader,
          },
          {
            path: "/details/:id",
            element: <DetailsPage />,
            loader: detailsLoader,
          },
          {
            path: "/documents",
            element: <Documents />,
          },
        ],
      },
    ],
  },
]);
