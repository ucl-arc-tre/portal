import Button from "./Button";
import "./LoginFallback.module.css";

export default function LoginFallback({
  title = "Access Restricted",
  message = "You must be logged in to view this page.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="login__wrapper">
      <h1>{title}</h1>
      <p>{message}</p>

      <Button size="large">
        <a href={`/oauth2/start?`} id="login">
          Login with UCL SSO
        </a>
      </Button>
    </div>
  );
}
