import { createRef, RefObject } from "react";
import { Home, Login } from "./pages";

type Route = {
  path: string;
  element: React.ReactNode; // Or React.ReactElement for elements
  name: string;
};

export const routes: Route[] = [
  {
    path: "/",
    element: <Home />,
    name: "Home",
  },
  {
    path: "/login",
    element: <Login />,
    name: "Login",
  },
];
