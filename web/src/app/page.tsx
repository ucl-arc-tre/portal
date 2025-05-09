"use client";

import { useEffect, useState } from "react";

import styles from "./page.module.css";
import Link from "next/link";

import { getProfile } from "@/openapi";
import { client } from "@/openapi/client.gen";

client.setConfig({
  baseUrl: "/api/v0",
});

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
    <div className={styles.page}>
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

            <Link href="/dashboard">
              <button>Go to Dashboard</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
