import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";

export default function Assets() {
  const { loading, isAuthed } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <Title text={"Assets"} />
      <p>This page is being built. Please check back soon for updates!</p>
    </>
  );
}
