import "./index.module.css";
import Head from "next/head";
import UserTasks from "./components/UserTasks";

export default function Home() {
  return (
    <>
      <Head>
        <title>ARC Services Portal | UCL</title>
        <meta property="description" content="ARC Services Portal homepage" key="description" />
      </Head>
      <div className="title">
        <h1>Welcome to the ARC Services Portal</h1>
        <p>This portal allows UCL researchers to manage ARC services and tasks.</p>
      </div>
      <UserTasks />
    </>
  );
}
