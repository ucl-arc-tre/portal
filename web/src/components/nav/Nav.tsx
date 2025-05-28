import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul className={styles.nav__list}>
          <li className={pathname === "/" ? "active" : ""}>
            <Link href="/">Home</Link>
          </li>

          <li className={pathname.startsWith("/assets") ? "active" : ""}>
            <Link href="/assets">Assets</Link>
          </li>

          <li className={pathname.startsWith("/studies") ? "active" : ""}>
            <Link href="/studies">Studies</Link>
          </li>

          <li className={pathname.startsWith("/projects") ? "active" : ""}>
            <Link href="/projects">Projects</Link>
          </li>

          <li className={pathname.startsWith("/profile") ? "active" : ""}>
            <Link href="/profile">Profile</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
