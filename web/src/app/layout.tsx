import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "test title",
  description: "test description",
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
