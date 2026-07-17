import { UserData } from "@/openapi";
import styles from "./UsersList.module.css";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

type Props = {
  users: UserData[];
};

function nonEmpty(chosenName: string | undefined) {
  return chosenName && chosenName !== "";
}

export default function UsersList(props: Props) {
  const { users } = props;
  return (
    <div className={styles["list"]}>
      {users.slice().map((user) => (
        <Card
          key={user.user.id}
          title={nonEmpty(user.chosen_name) ? user.chosen_name! : user.user.username}
          manageUrl={`/people/manage?userId=${user.user.id}`}
          headerContent={
            user.roles.includes("approved-researcher") && (
              <Badge className={styles["approved-researcher-badge"]} cy="approved-researcher">
                <span>{"Approved Researcher"}</span>
              </Badge>
            )
          }
        >
          {user.user.username}
        </Card>
      ))}
    </div>
  );
}
