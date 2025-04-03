import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import { getHello } from "./openapi";

function App() {
  const [count, setCount] = useState(0);
  const [helloMessage, setHelloMessage] = useState<string>("");

  useEffect(() => {
    getHello().then((res) => {
      if (res.response.status == 200 && res.data) {
        setHelloMessage(res.data.message);
      } else {
        console.log("error:", res.error);
      }
    });
  });

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button>
          <a href="/oauth2/start">Login</a>
        </button>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          GET /hello <strong>{helloMessage}</strong>
        </p>
      </div>
    </>
  );
}

export default App;
