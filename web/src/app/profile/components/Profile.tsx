"use client";

import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";

export default function Profile() {
  const { loading, isAuthed, userData } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <h1>Welcome, {userData?.username}!</h1>

      {!userData?.roles?.includes("approved-researcher") && (
        <>
          <p>
            It looks like you are not yet an approved researcher. To get started, follow the link below to start the
            approved researcher process.
          </p>

          <Link href="/profile/approved-researcher" className="btn" role="button">
            Become an approved researcher
          </Link>
        </>
      )}
    </>
  );
}
