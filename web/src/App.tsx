import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { useLocation } from "react-router-dom";
import { routes } from "./globals";
import Login from "./pages/Login";
import { getProfile } from "./openapi";

function App() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  const [helloMessage, setHelloMessage] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (location.pathname !== previousPath.current) {
      // todo: do something with this
      console.log("current path:", location.pathname);
    }

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
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} ref={route.nodeRef} />
        ))}
      </Routes>
      <h1>Welcome to the ARC Services Portal</h1>
      {!isAuthed && <Login />}
      <div className="card">
        <p>
          GET /hello → <strong>{helloMessage}</strong>
        </p>
      </div>
    </>
  );
}

export default App;
