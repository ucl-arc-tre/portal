import { StudyLifecycleStatus } from "@/openapi";
import Badge from "../ui/Badge";
import styles from "./StudyLifecycleBadge.module.css";

export default function StudyLifecycleBadge(props: { status: StudyLifecycleStatus }) {
  const { status } = props;

  return (
    <Badge className={styles[`status-${status.toLowerCase()}`]} cy="study-lifecycle-badge">
      {status}
    </Badge>
  );
}
