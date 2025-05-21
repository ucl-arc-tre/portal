import styles from "./Layout.module.css";
import Nav from "@/components/nav/Nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={styles.layout}>
        <Nav />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
