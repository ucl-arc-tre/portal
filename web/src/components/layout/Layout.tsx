"use client";
import styles from "./Layout.module.css";
import Nav from "@/components/nav/Nav";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("uikit-react-public").then((mod) => mod.Header), {
  ssr: false,
});
const Footer = dynamic(() => import("uikit-react-public").then((mod) => mod.Footer), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const { authInProgress, isAuthed } = useAuth();
  if (authInProgress) return null;

  return (
    <div className={styles.layout}>
      <Header title="UCL ARC Services Portal" className={styles["ucl-header"]} />

      {isAuthed && <Nav />}
      <main className={styles.content}>{children}</main>
      <Footer className={styles.footer} />
    </div>
  );
}
