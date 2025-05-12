import "./globals.css";
import "./layout.css";

import Nav from "@/components/nav/Nav";
import type { ReactNode } from "react";

import "@/lib/setupOpenApi";

export const metadata = {
  title: "UCL ARC | portal",
  description: "Portal for UCL ARC services",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Nav />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
