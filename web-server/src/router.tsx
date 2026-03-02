import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
  },
]);
