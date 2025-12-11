import { getStudiesByStudyIdAgreements } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./StudyAdminsAgreements.module.css";

type StudyAdminsAgreementsProps = {
  studyId: string;
  completed: boolean;
  studyAdminUsernames: Array<string>;
  setCompleted: (completed: boolean) => void;
};

export default function StudyAdminsAgreements(props: StudyAdminsAgreementsProps) {
  const { studyId, studyAdminUsernames, completed, setCompleted } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unagreedUsernames, setUnagreedUsernames] = useState<Array<string>>([]);

  useEffect(() => {
    const fetchStudyAgreementData = async () => {
      setIsLoading(true);

      try {
        setError(null);

        const studyAgreementsResult = await getStudiesByStudyIdAgreements({ path: { studyId } });
        if (studyAgreementsResult.response.status == 200 && studyAgreementsResult.data) {
          const confirmedAgreementUsernames = studyAgreementsResult.data.usernames;
          const allAgreed = studyAdminUsernames.every((username) => confirmedAgreementUsernames.includes(username));
          if (allAgreed) {
            setCompleted(true);
          } else {
            setUnagreedUsernames(
              studyAdminUsernames.filter((username) => !confirmedAgreementUsernames.includes(username))
            );
          }
        } else {
          setError("Failed to load study agreements. Please try again later.");
          return;
        }
      } catch (err) {
        console.error("Failed to load study agreements:", err);
        setError("Failed to load study agreements. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyAgreementData();
  }, [studyId, setCompleted, studyAdminUsernames]);

  if (isLoading) return null;

  if (completed) return null;

  if (error) {
    return (
      <div className={"error-message"}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className={styles["container"]} data-cy="study-admins-agreement-prompt">
      <p className={styles["description"]}>The following administrators must agree to the study agreement:</p>
      {unagreedUsernames.map((username) => (
        <li className={styles["bullet"]} key={username}>
          {username}
        </li>
      ))}
    </div>
  );
}
