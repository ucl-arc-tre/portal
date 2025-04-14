import { useEffect, useState } from "react";
import "./App.css";
import { getProfile } from "./openapi";

function App() {
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
      <h1 id="portal-title">ARC portal</h1>

      <main aria-label="ARC portal main content">
        {isAuthed === false && (
          <div>
            <a href="/oauth2/start" className="button">
              Login
            </a>
          </div>
        )}
        <div className="card">
          {isAuthed === true && (
            <p>
              GET /hello → <strong>{helloMessage}</strong>
            </p>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
