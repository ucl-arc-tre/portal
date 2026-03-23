import { useState } from "react";
import { ProfileTraining } from "@/openapi";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import Button from "../ui/Button";
import { Alert, AlertMessage } from "@/components/shared/uikitExports";
import styles from "./CertificateReupload.module.css";

type Props = {
  trainingData: ProfileTraining | null;
  expiryUrgency: ExpiryUrgency | null;
  onReupload: () => void;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const getExpiryDate = (completedAt: string) => {
  const expiry = new Date(completedAt);
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export default function CertificateReupload({ trainingData, expiryUrgency, onReupload }: Props) {
  const [showCertReupload, setShowCertReupload] = useState(false);

  const nhsdTraining = trainingData?.training_records.find((record) => record.kind === "training_kind_nhsd");

  return (
    <div className={styles["reupload-option"]}>
      <h2>Certificate Upload</h2>

      {expiryUrgency && (
        <Alert type={expiryUrgency.level === "critical" ? "error" : "warning"}>
          <AlertMessage>
            {expiryUrgency.level === "critical"
              ? "Your training certificate has expired. Please upload a new certificate."
              : "Your training certificate is expiring soon. Please upload a new certificate before it expires."}
          </AlertMessage>
        </Alert>
      )}

      {!expiryUrgency && (
        <p>
          Your current training certificate is within date, but you may update your certification at any time by
          uploading a new document.
        </p>
      )}

      {nhsdTraining?.completed_at && (
        <dl className={styles["cert-details"]}>
          <dt>Training completion date:</dt>
          <dd>{formatDate(nhsdTraining.completed_at)}</dd>
          <dt>Certificate expiry date:</dt>
          <dd>{getExpiryDate(nhsdTraining.completed_at)}</dd>
        </dl>
      )}

      <Button variant="secondary" size="small" onClick={() => setShowCertReupload((prev) => !prev)}>
        {!showCertReupload ? "Verify another certificate" : "Cancel"}
      </Button>

      {showCertReupload && <TrainingCertificate setTrainingCertificateCompleted={onReupload} />}
    </div>
  );
}
