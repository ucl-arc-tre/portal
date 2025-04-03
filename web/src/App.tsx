import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { getHello } from "./openapi";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    getHello().then((res) => {
      if (res.data) {
        setMessage(res.data.message);
      } else {
        console.log(res.error);
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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Backend response is <strong>{message}</strong>
        </p>
      </div>
    </>
  );
}

export default App;
