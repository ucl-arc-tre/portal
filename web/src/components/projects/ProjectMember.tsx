import { ProjectDshMember, ProjectTreMember } from "@/openapi";
import styles from "./ProjectMember.module.css";
import { roleLabel } from "./tre/roles";

type Props = {
  member: ProjectTreMember | ProjectDshMember;
  children?: React.ReactNode;
};

export default function ProjectMember(props: Props) {
  const { member, children } = props;

  return (
    <ul>
      <li key={member.username} className={styles["member-item"]}>
        <span className={styles["member-username"]}>{member.username}</span>
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
