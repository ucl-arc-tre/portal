"use client";

import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { loading, isAuthed, userData } = useAuth();

  if (loading) return <p>Loading…</p>;

  if (!isAuthed) {
    return (
      <>
        <p>You must be logged in to view this page</p>
        <a href={`/oauth2/start?rd=${encodeURIComponent(window.location.pathname)}`} className="btn--login">
          Login with UCL SSO
        </a>
      </>
    );
  }

  return (
    <>
      <h1>Welcome, {userData?.username}!</h1>

      {!userData?.roles?.includes("approved-researcher") && (
        <>
          <p>
            It looks like you are not yet an approved researcher. To get started, follow the link below to start the
            approved researcher process.
          </p>

          <p>
            <Link href="/profile/approved-researcher" className="btn--form">
              Become an approved researcher
            </Link>
          </p>
        </>
      )}
    </>
  );
}
