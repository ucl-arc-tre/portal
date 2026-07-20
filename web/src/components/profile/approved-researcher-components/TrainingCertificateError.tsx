import { AlertMessage } from "@/components/shared/uikitExports";
import styles from "./TrainingCertificateError.module.css";

type TrainingCertificateErrorProps = {
  text: string;
  showExtra?: boolean;
};

const manualApprovalEmailAddress = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "arc.tre@ucl.ac.uk";
const manualApprovalEmailBody = encodeURI("Dear UCL Information Governance,\n\n ...");
const manualApprovalEmailSubject = "Training certificate";

export default function TrainingCertificateError(props: TrainingCertificateErrorProps) {
  return (
    <AlertMessage>
      <div className={styles["error-wrapper"]}>
        {props.text}
        {props.showExtra && (
          <span>
            {" "}
            If you believe your certificate is valid please email it to{" "}
            <a
              href={`mailto:${manualApprovalEmailAddress}?body=${manualApprovalEmailBody}&subject=${manualApprovalEmailSubject}`}
            >
              {manualApprovalEmailAddress}
            </a>{" "}
            for manual approval.
          </span>
        )}
      </div>
    </AlertMessage>
  );
}
