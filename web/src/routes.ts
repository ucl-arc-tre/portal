import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/login", "./pages/Login.tsx"),
  route("*?", "catchall.tsx"), // * matches all URLs, the ? makes it optional so it will match / as well
] satisfies RouteConfig;
