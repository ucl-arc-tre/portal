import Profile from "./components/Profile";
import "./profile.css";

export const metadata = {
  title: "User Profile | ARC Services Portal",
  description: "View and manage your ARC profile and researcher status.",
};

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <p>This is your profile. More profile features coming soon.</p>

      <Profile />
    </div>
  );
}
