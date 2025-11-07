import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import Callout from "../ui/Callout";
import { AnyProject } from "@/types/projects";

type Props = {
  projects: AnyProject[];
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
