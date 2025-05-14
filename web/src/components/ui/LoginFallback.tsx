"use client";

export default function LoginFallback({
  title = "Access Restricted",
  message = "You must be logged in to view this page.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <>
      <h1>{title}</h1>
      <p>{message}</p>

      <a href={`/oauth2/start?`} className="login-link" role="button">
        Login with UCL SSO
      </a>
    </>
  );
}
