import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import Callout from "../ui/Callout";
import { Project } from "@/openapi";

type Props = {
  projects: Project[];
};

export default function Projects(props: Props) {
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
