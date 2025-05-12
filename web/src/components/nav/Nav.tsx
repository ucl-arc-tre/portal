import Link from "next/link";
import "./Nav.css";

export default function Nav() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">UCL ARC TRE</h2>

      <nav>
        <ul className="nav-list">
          <li>
            <Link href="/">Home</Link>
          </li>

          <li>
            <Link href="/approved-researcher">Approved researcher</Link>
          </li>

          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>

          <li>
            <Link href="/page-a">Page A</Link>
          </li>

          <li>
            <Link href="/page-b">Page B</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
