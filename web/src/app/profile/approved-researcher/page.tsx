"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/openapi";
import { client } from "@/openapi/client.gen";

import ApprovedResearcherForm from "./components/ApprovedResearcherForm";

client.setConfig({
  baseUrl: "/api/v0",
});

export default function ProfilePage() {
  const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getProfile();

        if (response.response.status === 200 && response.data) {
          setIsAuthed(true);
          setUsername(response.data.username);
        } else {
          setIsAuthed(false);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setIsAuthed(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthed === undefined) return <p>Loading...</p>;

  if (!isAuthed) {
    return (
      <div className="profile-page">
        <h1>Access Profile</h1>

        <p>You must be logged in to view this page</p>

        <a href="/oauth2/start" className="btn--login" id="login" role="button">
          Login with UCL SSO
        </a>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Welcome, {username}!</h1>

      <ApprovedResearcherForm />
    </div>
  );
}
