import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "./index.css";
import { client } from "./openapi/client.gen.ts";

client.setConfig({
  baseUrl: "/api/v0",
});

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
