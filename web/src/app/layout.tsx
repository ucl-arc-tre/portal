import "./globals.css";
import "./layout.css";

import { AuthProvider } from "../app/hooks/useAuth";
import Nav from "@/components/nav/Nav";

export const metadata = {
  title: "UCL ARC | portal",
  description: "Portal for UCL ARC services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="content__wrapper">
            <Nav />
            <main className="content">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
