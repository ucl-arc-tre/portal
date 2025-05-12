"use client";

import { useEffect, useState } from "react";

import "./page.css";

import { getProfile } from "@/openapi";

export default function Home() {
  const [helloMessage, setHelloMessage] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();

        if (response.response.status === 200 && response.data) {
          const { username, roles } = response.data;
          setHelloMessage(`Username: ${username}. Roles: ${roles.join(", ")}`);
          setIsAuthed(true);
        } else {
          setIsAuthed(false);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsAuthed(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="page">
      <h1 id="title--portal">Welcome to the ARC Services Portal</h1>

      {isAuthed === undefined && <p>Loading...</p>}

      {isAuthed === false && (
        <a href="/oauth2/start" className="btn--login" id="login" role="button">
          Login with UCL SSO
        </a>
      )}

      {isAuthed === true && (
        <>
          <div className="card">
            <p id="confirmation--login">
              GET /profile → <strong>{helloMessage}</strong>
            </p>
            <div>Your tasks:</div>
            <div>List of user tasks here (e.g. approved researcher process)</div>
          </div>
        </>
      )}
    </div>
  );
}
