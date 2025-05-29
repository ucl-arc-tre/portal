import MetaHead from "@/components/meta/Head";
import Profile from "@/components/profile/Profile";

export default function ProfilePage() {
  return (
    <>
      <MetaHead
        title="User Profile | ARC Services Portal"
        description="View and manage your ARC profile and researcher status"
      />
      <div>
        <h1>Profile</h1>
        <Profile />
      </div>
    </>
  );
}
