import type { Metadata } from "next";
import "./globals.css";
import "./ui/buttons.css";

export const metadata: Metadata = {
  title: "UCL ARC | portal",
  description: "Portal for UCL ARC services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
