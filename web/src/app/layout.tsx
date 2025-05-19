import "./globals.css";
import "./layout.css";

import { AuthProvider } from "../app/hooks/useAuth";
import Nav from "@/components/nav/Nav";
import Page from "@/components/ui/Page";

export const metadata = {
  title: "UCL ARC | portal",
  description: "Portal for UCL ARC services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="page">
            <Nav />
            <Page>{children}</Page>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
