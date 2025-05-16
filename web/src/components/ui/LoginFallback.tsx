"use client";

import "./LoginFallback.css";

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

      <a href={`/oauth2/start?`} className="button--sso-login" role="button" id="login">
        Login with UCL SSO
      </a>
    </div>
  );
}
