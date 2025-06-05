import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";
import Button from "../ui/Button";
import dynamic from "next/dynamic";
import { ReactElement } from "react";

const HomeIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Home), {
  ssr: false,
});
const AvatarIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Avatar), {
  ssr: false,
});
const FolderIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Folder), {
  ssr: false,
});
const FileIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.File), {
  ssr: false,
});
const PaperclipIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Paperclip), {
  ssr: false,
});
const UsersIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Users), {
  ssr: false,
});

function NavItem({ href, icon, title }: { href: string; icon: ReactElement; title: string }) {
  const pathname = usePathname();
  return (
    <li className={pathname === href ? styles.active : ""}>
      <Button href={href} variant="tertiary" icon={icon}>
        {title}
      </Button>
    </li>
  );
}

export default function Nav() {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <h4>Menu</h4>
        <hr />
        <ul className={styles.nav__list}>
          <NavItem href="/" icon={<HomeIcon />} title="Home" />

          <NavItem href="/studies" icon={<FolderIcon />} title="Studies" />

          <NavItem href="/projects" icon={<FileIcon />} title="Projects" />

          <NavItem href="/assets" icon={<PaperclipIcon />} title="Assets" />

          <NavItem href="/people" icon={<UsersIcon />} title="People" />

          <NavItem href="/profile" icon={<AvatarIcon />} title="Profile" />
        </ul>
      </nav>
    </aside>
  );
}
