import Badge from "./Badge";
import styles from "./LifecycleStatusBadge.module.css";

export default function LifecycleStatusBadge(props: { status: "active" | "destroyed" | "closed" }) {
  const { status } = props;

  return (
    <Badge className={`${styles["lifecycle-badge"]} ${styles[`status-${status}`]}`} cy="lifecycle-badge">
      {status}
    </Badge>
  );
}
