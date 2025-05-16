"use client";

import { useAuth } from "./hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";

export default function UserTasks() {
  const { loading, isAuthed, userData } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <div className="card card--user-tasks">
      <p>
        Username&nbsp;{userData!.username}. Roles:&nbsp;
        {userData!.roles.join(", ")}
      </p>

      <div>Your tasks:</div>
      <div>List of user tasks here (e.g. approved researcher process)</div>
    </div>
  );
}
