import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";

export default function Projects() {
  const { loading, isAuthed } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <Title text={"Projects"} />
      <p>This page is being built. Please check back soon for updates!</p>
    </>
  );
}
