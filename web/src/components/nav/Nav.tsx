import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";
import Button from "../ui/Button";
import dynamic from "next/dynamic";

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

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav>
        <h4>Menu</h4>
        <hr />
        <ul className={styles.nav__list}>
          <li className={pathname === "/" ? styles.active : ""}>
            <Button href="/" variant="tertiary" icon={<HomeIcon />}>
              Home
            </Button>
          </li>

          <li className={pathname.startsWith("/studies") ? styles.active : ""}>
            <Button href="/studies" variant="tertiary" icon={<FolderIcon />}>
              Studies
            </Button>
          </li>

          <li className={pathname.startsWith("/projects") ? styles.active : ""}>
            <Button href="/projects" variant="tertiary" icon={<FileIcon />}>
              Projects
            </Button>
          </li>

          <li className={pathname.startsWith("/assets") ? styles.active : ""}>
            <Button href="/assets" variant="tertiary" icon={<PaperclipIcon />}>
              Assets
            </Button>
          </li>

          <li className={pathname.startsWith("/profile") ? styles.active : ""}>
            <Button href="/profile" variant="tertiary" icon={<AvatarIcon />}>
              Profile
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
