import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";
import Button from "../ui/Button";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { client } from "@/openapi/client.gen";
import { useAuth } from "@/hooks/useAuth";

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
const LogoutIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.LogOut), {
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
  const logoutUrl = client.getConfig().baseUrl + "/logout";

  const { authInProgress, userData } = useAuth();
  if (authInProgress) return null;

  const isAdmin = userData?.roles.includes("admin");
  const isApprovedStaffResearcher = userData?.roles.includes("approved-staff-researcher");
  const isIAO = userData?.roles.includes("information-asset-owner");

  const canSeeStudies = isApprovedStaffResearcher || isAdmin;
  const canSeeProjects = isIAO || isAdmin;
  const canSeeAssets = isIAO || isAdmin;
  const canSeePeople = isIAO || isAdmin;

  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Main navigation">
        <h2>Menu</h2>
        <hr />
        <ul className={styles.nav__list}>
          <NavItem href="/" icon={<HomeIcon />} title="Home" />

          {canSeeStudies && <NavItem href="/studies" icon={<FolderIcon />} title="Studies" />}

          {canSeeProjects && <NavItem href="/projects" icon={<FileIcon />} title="Projects" />}
          {canSeeAssets && <NavItem href="/assets" icon={<PaperclipIcon />} title="Assets" />}

          {canSeePeople && <NavItem href="/people" icon={<UsersIcon />} title="People" />}

          <NavItem href="/profile" icon={<AvatarIcon />} title="Profile" />
        </ul>
      </nav>
      <Button variant="tertiary" className={styles.logout} href={logoutUrl}>
        Log out <LogoutIcon />
      </Button>
    </aside>
  );
}
