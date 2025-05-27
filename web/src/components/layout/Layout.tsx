import styles from "./Layout.module.css";
import Nav from "@/components/nav/Nav";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("uikit-react-public").then((mod) => mod.Header), {
  ssr: false,
});
const Footer = dynamic(() => import("uikit-react-public").then((mod) => mod.Footer), {
  ssr: false,
});
const ThemeContextProvider = dynamic(() => import("uikit-react-public").then((mod) => mod.ThemeContextProvider), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeContextProvider>
        <div className={styles.layout}>
          <Header title="UCL ARC Services Portal" />
          <Nav />
          <main className={styles.main}>{children}</main>
          <Footer />
        </div>
      </ThemeContextProvider>
    </>
  );
}
