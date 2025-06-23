import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import { useEffect, useState } from "react";
import ChosenNameForm from "./ChosenNameForm";
import { getProfile } from "@/openapi";

export default function UserTasks() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();

        if (response.response.ok && response.data?.chosen_name) {
          setChosenName(response.data.chosen_name);
        } else {
          setChosenName("");
        }
      } catch (error) {
        console.error("Failed to get profile:", error);
        setChosenName("");
      }
    };
    fetchProfile();
  }, []);

  if (authInProgress || chosenName === undefined) return null;

  if (!isAuthed || !userData) return <LoginFallback />;

  return (
    <div>
      {!chosenName && <ChosenNameForm setChosenName={setChosenName} />}

      <p>Name: {chosenName}</p>

      <p>Username&nbsp;{userData.username}</p>

      <p>
        Roles:&nbsp;
        {userData.roles.join(", ")}
      </p>
    </div>
  );
}
