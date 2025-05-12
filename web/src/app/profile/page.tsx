"use client";

import { useEffect, useState } from "react";
import { getProfile, ProfileResponse } from "@/openapi";
import { client } from "@/openapi/client.gen";
import Link from "next/link";

import "./profile.css";

client.setConfig({
  baseUrl: "/api/v0",
});

export default function ProfilePage() {
  const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);
  const [userData, setUserData] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getProfile();

        if (response.response.status === 200 && response.data) {
          setIsAuthed(true);
          setUserData(response.data);
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
      <h1>Welcome, {userData?.username}!</h1>
      <p>This is your profile. More profile features coming soon.</p>

      {!userData?.roles?.includes("approved-researcher") && (
        <p>
          It looks like you are not yet an approved researcher. To get started, follow the link below to fill out the
          form:
          <Link href="/profile/approved-researcher" className="btn--form">
            Approved Researcher Form
          </Link>
          .
        </p>
      )}
    </div>
  );
}
