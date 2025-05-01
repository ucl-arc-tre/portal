"use client";

import { useEffect, useState } from "react";

import { getProfile } from "@/openapi";
import styles from "./page.module.css";
import Link from "next/link";

import { client } from "@/openapi/client.gen";

client.setConfig({
  baseUrl: "/api/v0",
});

export default function Home() {
  const [helloMessage, setHelloMessage] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getProfile()
      .then((res) => {
        if (res.response.status == 200 && res.data) {
          setHelloMessage(`Username: ${res.data.username}. Roles: ${res.data.roles.join(",")}`);
          setIsAuthed(true);
        } else {
          setIsAuthed(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
  return (
    <div className={styles.page}>
      <h1 id="portal-title">Welcome to the ARC Services Portal</h1>
      <main aria-label="ARC portal main content">
        {isAuthed === false && (
          <div>
            <Link href="/oauth2/start">
              <button className="btn--login">Login with UCL SSO</button>
            </Link>
          </div>
        )}

        {isAuthed === true && (
          <>
            {/* TODO: get rid of this at some point - replace with some sort of notif on login */}
            <div className="card">
              <p>
                GET /profile → <strong>{helloMessage}</strong>
              </p>
              <Link href="/dashboard">
                <button>Go to Dashboard</button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
