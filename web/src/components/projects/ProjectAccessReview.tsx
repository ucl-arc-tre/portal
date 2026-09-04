import Error from "@/components/ui/Error";
import { Alert, Checkbox, Label } from "@/components/shared/uikitExports";
import styles from "./ProjectAccessReview.module.css";
import { useState } from "react";
import {
  postProjectsTreByProjectIdAccessReviewSignoff,
  postProjectsDshByProjectIdAccessReviewSignoff,
} from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";

type ProjectAccessReviewProps = {
  projectId: string;
  environment: "tre" | "dsh";
  successCallback: () => Promise<void>;
};

export default function ProjectAccessReview(props: ProjectAccessReviewProps) {
  const { projectId, environment, successCallback } = props;

  const [reviewChecked, setReviewChecked] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSignoff = async () => {
    setReviewError(null);
    setIsReviewing(true);
    const signoff =
      environment === "tre"
        ? postProjectsTreByProjectIdAccessReviewSignoff
        : postProjectsDshByProjectIdAccessReviewSignoff;
    const response = await signoff({ path: { projectId: projectId } });
    if (responseIsError(response)) {
      setReviewError(extractErrorMessage(response));
    } else {
      setReviewChecked(false);
      await successCallback();
    }
    setIsReviewing(false);
  };

  return (
    <div className={styles["review-warning"]}>
      <Alert type="warning">
        <h3>Project access review</h3>
        <p>As an information asset owner or admin, you are required to confirm that this project:</p>
        <ul>
          <li>Has the correct access rights assigned to all project members.</li>
          <li>Has the correct roles assigned to each of those members.</li>
        </ul>

        <p className={styles["review-confirm-text"]}>
          Please confirm the above statements are correct or update the project&apos;s members as necessary.
        </p>

        <div className={styles["review-checkbox"]}>
          <Label>
            <Checkbox
              checked={reviewChecked}
              onChange={(e) => setReviewChecked(e.target.checked)}
              disabled={isReviewing}
              data-cy="project-access-review-confirm-checkbox"
            />{" "}
            I confirm member access rights and roles for this project are correct.
          </Label>
        </div>

        {reviewError && <Error message={reviewError} />}

        <div className={styles["review-button-container"]}>
          <Button
            onClick={handleSignoff}
            disabled={!reviewChecked || isReviewing}
            size="small"
            cy="project-access-review-confirm-button"
          >
            {isReviewing ? "Submitting..." : "Confirm Details"}
          </Button>
        </div>
      </Alert>
    </div>
  );
}
