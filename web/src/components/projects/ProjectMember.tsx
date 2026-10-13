import { ProjectDshMember, ProjectTreMember } from "@/openapi";
import styles from "./ProjectMember.module.css";
import { roleLabel } from "./tre/roles";

type Props = {
  member: ProjectTreMember | ProjectDshMember;
  children?: React.ReactNode;
};

export default function ProjectMember(props: Props) {
  const { member, children } = props;
  const name = member.user.name;
  const username = member.user.username;

  return (
    <ul>
      <li key={username} className={styles["member-item"]}>
        <span className={styles["member-username"]}>{name ? `${name} (${username})` : username}</span>
        <div className={styles["member-roles"]}>
          {member.roles.map((role, roleIndex) => (
            <span key={roleIndex} className={styles["role-badge"]}>
              {roleLabel(role)}
            </span>
          ))}
        </div>
        {children}
      </li>
    </ul>
  );
}
