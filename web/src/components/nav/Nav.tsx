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
const UsersIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Users), {
  ssr: false,
});
const LogoutIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.LogOut), {
  ssr: false,
});
const MetricsIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Disc), {
  ssr: false,
});
const MenuSection = dynamic(() => import("uikit-react-public").then((mod) => mod.MenuNew.Section), {
  ssr: false,
});
const SecondaryMenuItem = dynamic(() => import("uikit-react-public").then((mod) => mod.MenuNew.SecondaryItem), {
  ssr: false,
});
const PrimaryMenuItem = dynamic(() => import("uikit-react-public").then((mod) => mod.MenuNew.PrimaryItem), {
  ssr: false,
});
const MenuDivider = dynamic(() => import("uikit-react-public").then((mod) => mod.MenuNew.Divider), {
  ssr: false,
});

type NavItemProps = {
  href: string;
  icon: ReactElement;
  title: string;
  additionalPaths?: string[];
};
function NavItem(NavItemProps: NavItemProps) {
  const { href, icon, title, additionalPaths = [] } = NavItemProps;
  const pathname = usePathname();
  const paths = [href, ...additionalPaths];
  const isActive = paths.some((path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)
  );

  return (
    <PrimaryMenuItem active={isActive} icon={icon}>
      <Button href={href} variant="tertiary">
        {title}
      </Button>
    </PrimaryMenuItem>
  );
}

export default function Nav() {
  const logoutUrl = client.getConfig().baseUrl + "/logout";

  const {
    authInProgress,
    isIGStaff,
    isAdmin,
    isDshOpsStaff,
    isTreOpsStaff,
    isApprovedResearcher,
    isApprovedStaffResearcher,
    isIAO,
  } = useAuth();
  if (authInProgress) return null;

  const canSeeStudies = isApprovedStaffResearcher || isAdmin || isIGStaff;
  const canSeeProjects = isApprovedResearcher || isAdmin || isTreOpsStaff || isDshOpsStaff || isIGStaff;
  const canSeePeople = isIAO || isTreOpsStaff || isAdmin || isIGStaff;
  const canSeeMetrics = isAdmin || isIGStaff;

  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Main navigation">
        <MenuSection>
          <h2>Menu</h2>
          <hr />
          <NavItem href="/" icon={<HomeIcon />} title="Home" />

          {canSeeStudies && (
            <NavItem
              href="/studies"
              additionalPaths={["/assets", "/contracts"]}
              icon={<FolderIcon />}
              title="Studies"
            />
          )}

          {canSeeProjects && <NavItem href="/projects" icon={<FileIcon />} title="Projects" />}

          {canSeePeople && <NavItem href="/people" icon={<UsersIcon />} title="People" />}

          {canSeeMetrics && <NavItem href="/metrics" icon={<MetricsIcon />} title="Metrics" />}

          <NavItem href="/profile" icon={<AvatarIcon />} title="Profile" />
        </MenuSection>
        <MenuDivider />
        <MenuSection>
          <SecondaryMenuItem>
            <Button variant="tertiary" className={styles.logout} href={logoutUrl}>
              Log out <LogoutIcon />
            </Button>
          </SecondaryMenuItem>
        </MenuSection>
      </nav>
    </aside>
  );
}
