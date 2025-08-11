import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import Callout from "../ui/Callout";

export default function Projects() {
  const { authInProgress, isAuthed } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <Title centered text={"Projects"} />

      <Callout construction />
    </>
  );
}
