import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { getUsersByUserId, UserData } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import Box from "@/components/ui/Box";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function ManageProjectPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { authInProgress, isAuthed } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (userIdParam: string) => {
    try {
      const response = await getUsersByUserId({
        path: { userId: userIdParam },
      });

      if (responseIsError(response) || !response.data) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to load user: ${errorMsg}`);
        return;
      }
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && typeof userId === "string") {
      fetchData(userId);
    }
  }, [userId]);

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;
  if (loading) return <Loading />;

  if (error || !user) {
    return (
      <div className="container">
        <Title text={!user ? "Not found" : "Error"} />
        {error && <p className={styles.error}>{error}</p>}
        <Button onClick={() => router.push("/people")} variant="secondary">
          Back to People
        </Button>
      </div>
    );
  }

  const userLabel = user.chosen_name ?? user.user.username;

  return (
    <>
      <MetaHead title={`Manage Person: ${userLabel}`} description={`Manage user details for ${userLabel}`} />

      <Breadcrumbs
        links={[
          {
            title: "People",
            url: "/people",
          },
          {
            title: userLabel,
            url: `/people/manage?userId=${userId}`,
          },
        ]}
      />

      <div className="content">
        <Box>
          <div className={styles.field}>
            <label>Chosen name:</label>
            <span>{user.chosen_name ?? "Unset"}</span>
          </div>
        </Box>
      </div>
    </>
  );
}
