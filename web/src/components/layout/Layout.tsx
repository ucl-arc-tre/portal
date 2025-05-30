"use client";
import styles from "./Layout.module.css";
import Nav from "@/components/nav/Nav";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("uikit-react-public").then((mod) => mod.Header), {
  ssr: false,
});
const Footer = dynamic(() => import("uikit-react-public").then((mod) => mod.Footer), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="UCL ARC Services Portal" className={styles.ucl_header} />
      <Nav />
      <div className={styles.layout}>
        <main className={styles.content}>{children}</main>
      </div>
      <Footer />
    </>
  );
}
