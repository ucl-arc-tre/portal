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
import Error from "@/components/ui/Error";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import styles from "./ManageUser.module.css";
import ChosenNameForm from "@/components/people/ChosenNameForm";
import EditIcon from "@/components/ui/EditIcon";
import { formatTime, getHumanReadableTrainingKind } from "@/components/shared/exports";
import { CheckIcon, XIcon } from "@/components/shared/uikitExports";
import TrainingForm from "@/components/people/TrainingForm";

export default function ManageUserPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosenNameDialogOpen, setChosenNameDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const userIdIsSet = userId && typeof userId === "string";
  const canEdit = userData?.roles.includes("admin") || userData?.roles.includes("ig-ops-staff");

  const fetchData = async (userIdParam: string) => {
    setLoading(true);
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
    if (userIdIsSet) {
      fetchData(userId);
    }
  }, [userId, userIdIsSet]);

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;
  if (loading) return <Loading />;

  if (error || !user) {
    return (
      <div className="container">
        <Title text={!user ? "Not found" : "Error"} />
        {error && <Error message={error} />}
        <Button onClick={() => router.push("/people")} variant="secondary">
          Back to People
        </Button>
      </div>
    );
  }

  const chosenNameUnset = !user.chosen_name || user.chosen_name === "";
  const userLabel = chosenNameUnset ? user.user.username : user.chosen_name!;
  const trainingRecords = user.training_record.training_records;
  const nonBaseRoles = user.roles.filter((role) => !role.includes("base")).sort();

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
          <h3 className={styles["title"]}>{chosenNameUnset ? user.user.username : user.chosen_name}</h3>
          <div className={styles.field}>
            <label>Username: </label>
            <span>{user.user.username}</span>
          </div>

          <div className={styles.field}>
            <label>Chosen name: </label>
            <span>
              {chosenNameUnset ? "Not set" : user.chosen_name}{" "}
              {canEdit && (
                <EditIcon
                  onClick={() => setChosenNameDialogOpen(true)}
                  label="Request chosen name change"
                  cy="edit-name-button"
                />
              )}
            </span>
          </div>

          <div className={styles.field}>
            <label>Agreements: </label>
            {user.agreements.confirmed_agreements.length === 0 && "None"}
            {user.agreements.confirmed_agreements.map((agreement) => (
              <div key={agreement.agreement_type} className={styles["agreement"]}>
                <p>{agreement.agreement_type}</p>
                {agreement.confirmed_at && <small>Agreed to {formatTime(agreement.confirmed_at)}</small>}
              </div>
            ))}
          </div>

          <div className={styles.field}>
            <label>Training: </label>
            <div className={styles.trainingRecord}>
              {!trainingRecords || (trainingRecords.length === 0 && "None")}
              {trainingRecords?.map((training) => (
                <div key={`${training.kind}-${training.completed_at}`} className={styles["training"]}>
                  <p>
                    {getHumanReadableTrainingKind(training.kind)}{" "}
                    {training.is_valid ? (
                      <span className={styles.valid}>
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className={styles.invalid}>
                        <XIcon />
                      </span>
                    )}
                  </p>
                  {training.completed_at && (
                    <small>
                      Completed on {formatTime(training.completed_at)}. {!training.is_valid && "Not "} Valid.
                    </small>
                  )}
                </div>
              ))}
            </div>
            {canEdit && (
              <>
                <div></div>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => setTrainingDialogOpen(true)}
                  cy="add-training-record"
                >
                  Add +
                </Button>
              </>
            )}
          </div>

          <div className={styles.field}>
            <label>Roles: </label>
            <div>
              {nonBaseRoles.length === 0 && "None"}
              {nonBaseRoles.map((role) => (
                <p key={role} className={"role " + styles["role"]}>
                  {role}
                </p>
              ))}
            </div>
          </div>
        </Box>
      </div>

      {chosenNameDialogOpen && userIdIsSet && (
        <ChosenNameForm
          userId={userId}
          currentChosenName={user.chosen_name}
          setChosenNameDialogOpen={setChosenNameDialogOpen}
          callback={() => fetchData(userId)}
        />
      )}

      {trainingDialogOpen && userIdIsSet && (
        <TrainingForm
          userId={userId}
          setTrainingDialogOpen={setTrainingDialogOpen}
          callback={() => fetchData(userId)}
        />
      )}
    </>
  );
}
