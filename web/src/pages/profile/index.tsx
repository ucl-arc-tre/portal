import Profile from "@/components/profile/Profile";
import Head from "next/head";

export default function ProfilePage() {
  return (
    <>
      <Head>
        <title>User Profile | ARC Services Portal</title>
        <meta
          property="description"
          content="View and manage your ARC profile and researcher status"
          key="description"
        />
      </Head>
      <div>
        <h1>Profile</h1>
        <p>This is your profile. More profile features coming soon.</p>

        <Profile />
      </div>
    </>
  );
}
