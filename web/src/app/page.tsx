import UserTasks from "./UserTasks";
import "./page.css";

export const metadata = {
  title: "ARC Services Portal | UCL",
  description: "Login to access the ARC Services Portal.",
};

export default function Home() {
  return (
    <div className="page__content__inner--centered">
      <div className="title">
        <h1>Welcome to the ARC Services Portal</h1>
        <p>This portal allows UCL researchers to manage ARC services and tasks.</p>
      </div>
      <UserTasks />
    </div>
  );
}
