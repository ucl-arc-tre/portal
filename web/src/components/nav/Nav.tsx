"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Nav.css";

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">UCL ARC Portal</h2>

      <nav>
        <ul className="nav-list">
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
