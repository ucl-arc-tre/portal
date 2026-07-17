import { UserData } from "@/openapi";
import styles from "./StudyCardsList.module.css";
import Card from "../ui/Card";

type Props = {
  users: UserData[];
};

export default function UsersList(props: Props) {
  const { users } = props;

  return (
    <div className={styles["study-selection"]}>
      <div className={styles["studies-list"]}>
        {users.slice().map((user) => (
          <Card
            key={user.user.id}
            title={user.chosen_name ?? user.user.username}
            manageUrl={`/people/manage?userId=${user.user.id}`}
          >
            {""}
          </Card>
        ))}
      </div>
    </div>
  );
}
