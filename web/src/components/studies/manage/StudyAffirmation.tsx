import { Alert, AlertMessage } from "@/components/shared/uikitExports";
import styles from "./StudyAffirmation.module.css";
import { useState } from "react";
import { postStudiesByStudyIdSignoff } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";

type StudyAffirmationProps = {
  studyId: string;
  successCallback: () => Promise<void>;
  isReaffirmation?: boolean | undefined;
};

export default function StudyAffirmation(props: StudyAffirmationProps) {
  const { studyId, successCallback, isReaffirmation } = props;

  const [attestationChecked, setAttestationChecked] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationError, setAttestationError] = useState<string | null>(null);

  const title = isReaffirmation ? "Study reaffirmation" : "Study affirmation";

  const handleSignoff = async () => {
    setAttestationError(null);
    setIsAttesting(true);
    const response = await postStudiesByStudyIdSignoff({ path: { studyId: studyId } });
    if (responseIsError(response)) {
      setAttestationError(extractErrorMessage(response));
    } else {
      setAttestationChecked(false);
      await successCallback();
    }
    setIsAttesting(false);
  };

  return (
    <div className={styles["signoff-warning"]}>
      <Alert type="warning">
        <h3>{title}</h3>
        <p>As Study Owner you are required to confirm that your study:</p>
        <ul>
          {isReaffirmation && <li>Is still ongoing.</li>}
          <li>Has the correct Study Administrators assigned.</li>
          <li>Has the correct roles assigned to project users.</li>
          <li>Has all the correct information and references.</li>
          <li>Has all relevant contracts and assets required within their retention periods.</li>
        </ul>

        <br />
        <p>You must also confirm that:</p>
        <ul>
          <li>You accept the risk identified for this study.</li>
          <li>
            You accept that compliance with contracts in relation to confidential information and that having adequate
            contracts with third parties are the responsibility of your team, which you are specifically accountable
            for.
          </li>
          <li>
            You agree that the study may be subject to an audit of the confidentiality policies and procedures within
            the Information Governance Framework, in order to seek further assurance and to comply with the
            university&apos;s regulatory requirements.
          </li>
        </ul>

        <p className={styles["signoff-confirm-text"]}>
          Confirm these statements are correct or update your Study as necessary.
        </p>

        <div className={styles["signoff-checkbox"]}>
          <label>
            <input
              type="checkbox"
              checked={attestationChecked}
              onChange={(e) => setAttestationChecked(e.target.checked)}
              disabled={isAttesting}
            />{" "}
            I confirm the above details are correct.
          </label>
        </div>

        {attestationError && (
          <Alert type="error">
            <AlertMessage>{attestationError}</AlertMessage>
          </Alert>
        )}

        <div className={styles["signoff-button-container"]}>
          <Button onClick={handleSignoff} disabled={!attestationChecked || isAttesting} size="small">
            {isAttesting ? "Submitting..." : "Confirm Details"}
          </Button>
        </div>
      </Alert>
    </div>
  );
}
