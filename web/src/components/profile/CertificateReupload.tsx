import { useState } from "react";
import { ProfileTraining } from "@/openapi";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import Button from "../ui/Button";
import styles from "./CertificateReupload.module.css";

type Props = {
  trainingData: ProfileTraining | null;
  onReupload: () => void;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const getExpiryDate = (completedAt: string) => {
  const expiry = new Date(completedAt);
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export default function CertificateReupload({ trainingData, onReupload }: Props) {
  const [showCertReupload, setShowCertReupload] = useState(false);

  const toggleShowCertReupload = () => setShowCertReupload((prev) => !prev);

  const nhsdTraining = trainingData?.training_records.find((r) => r.kind === "training_kind_nhsd");

  return (
    <div className={styles["reupload-option"]}>
      <h2>Certificate Upload</h2>

      <p>
        Your current training certificate is within date, but you may update your certification at any time by uploading
        a new document.
      </p>

      {nhsdTraining?.completed_at && (
        <dl className={styles["cert-details"]}>
          <dt>Upload date:</dt>
          <dd>{formatDate(nhsdTraining.completed_at)}</dd>
          <dt>Expiry date:</dt>
          <dd>{getExpiryDate(nhsdTraining.completed_at)}</dd>
        </dl>
      )}

      <Button variant="secondary" size="small" onClick={toggleShowCertReupload}>
        {!showCertReupload ? "Verify another certificate" : "Cancel"}
      </Button>

      {showCertReupload && <TrainingCertificate setTrainingCertificateCompleted={onReupload} />}
    </div>
  );
}
