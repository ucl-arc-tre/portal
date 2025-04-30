"use client";

import { useEffect, useState } from "react";

import { getProfile } from "../../openapi";

function Login() {
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
    <>
      <h1 id="portal-title">Welcome to the ARC Services Portal</h1>
      <main aria-label="ARC portal main content">
        {isAuthed === false && (
          <div>
            <button>
              <a href="/oauth2/start">Login with UCL SSO</a>
            </button>
          </div>
        )}

        {isAuthed === true && (
          <>
            {/* TODO: get rid of this at some point - replace with some sort of notif on login */}
            <div className="card">
              <p>
                GET /profile → <strong>{helloMessage}</strong>
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Login;
