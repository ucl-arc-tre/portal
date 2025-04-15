import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { client } from "./openapi/client.gen.ts";
import { BrowserRouter } from "react-router-dom";

client.setConfig({
  baseUrl: "/api/v0",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
