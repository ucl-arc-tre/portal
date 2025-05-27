// import { Footer, Header } from "uikit-react-public";
import styles from "./Layout.module.css";
import Nav from "@/components/nav/Nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={styles.layout}>
        {/* <Header title="UCL ARC Services Portal" /> */}
        <Nav />
        <main className={styles.main}>{children}</main>
        {/* <Footer /> */}
      </div>
    </>
  );
}
