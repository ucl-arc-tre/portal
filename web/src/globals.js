import { createRef } from "react";
import { Home, Login } from "./pages";

// we can make this a .ts file but I ran into issues getting the page imports and the element parsing to work

export const routes = [
  {
    path: "/",
    element: Home,
    name: "Home",
    nodeRef: createRef(),
  },
  {
    path: "/login",
    element: Login,
    name: "Login",
    nodeRef: createRef(),
  },
];
