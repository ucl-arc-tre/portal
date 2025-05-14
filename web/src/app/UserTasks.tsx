"use client";

import { useAuth } from "./hooks/useAuth";

export default function UserTasks() {
  const { isAuthed, userData } = useAuth();

  if (!isAuthed) {
    return (
      <a href={`/oauth2/start`} className="btn--login" id="login">
        Login with UCL SSO
      </a>
    );
  }

  return (
    <div className="card">
      <p>
        Username&nbsp;{userData!.username}. Roles:&nbsp;
        {userData!.roles.join(", ")}
      </p>

      <div>Your tasks:</div>
      <div>List of user tasks here (e.g. approved researcher process)</div>
    </div>
  );
}
