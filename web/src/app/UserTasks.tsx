"use client";

import { useAuth } from "./hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";

export default function UserTasks() {
  const { loading, isAuthed, userData } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <div>
      <p>
        Username&nbsp;{userData!.username}. Roles:&nbsp;
        {userData!.roles.join(", ")}
      </p>
      <div className="tasks__wrapper">
        <h3>Your tasks:</h3>
        <div>List of user tasks here (e.g. approved researcher process)</div>
      </div>
    </div>
  );
}
