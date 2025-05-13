"use client";

import { useAuth } from "./hooks/useAuth";

export default function UserTasks() {
  const { loading, isAuthed, userData } = useAuth();

  if (loading) return <p>Loading…</p>;

  if (!isAuthed) {
    return (
      <a href={`/oauth2/start?rd=${encodeURIComponent(window.location.pathname)}`} className="btn--login" id="login">
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
