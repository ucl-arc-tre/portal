import styles from "./TrainingCertificateError.module.css";

import dynamic from "next/dynamic";
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

type TrainingCertificateErrorProps = {
  text: string;
  showExtra?: boolean;
};

const manualApprovalEmailAddress = "ig-training@ucl.ac.uk";
const manualApprovalEmailBody = encodeURI("Dear UCL Information Governance,\n\n ...");
const manualApprovalEmailSubject = "Training certificate";

export default function TrainingCertificateError(props: TrainingCertificateErrorProps) {
  return (
    <AlertMessage>
      <div className={styles["error-wrapper"]}>
        {props.text}
        {props.showExtra && (
          <span>
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
