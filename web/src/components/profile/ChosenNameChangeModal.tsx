import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import styles from "./ChosenNameChangeModal.module.css";

type ChosenNameChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentChosenName?: string;
};

const emailAddress = "arc.tre@ucl.ac.uk";
const emailSubject = "TRE Portal: Chosen Name Change Request";
const emailBody = `Dear UCL Information Governance,

I would like to request a change to my chosen name in the UCL ARC Services Portal.

Current chosen name: [Your current chosen name]
Requested new chosen name: [Your desired chosen name]
Reason for change: [Optional - please provide a brief reason]

Thank you for your assistance.

Kind regards`;

export default function ChosenNameChangeModal({ isOpen, onClose, currentChosenName }: ChosenNameChangeModalProps) {
  if (!isOpen) return null;

  const encodedEmailBody = encodeURIComponent(
    emailBody.replace("[Your current chosen name]", currentChosenName || "Not set")
  );
  const encodedEmailSubject = encodeURIComponent(emailSubject);

  return (
    <Dialog setDialogOpen={onClose}>
      <div className={styles.container}>
        <h2>Request Chosen Name Change</h2>

        <div className={styles.description}>
          <p>
            To change your chosen name, please send an email to the UCL Information Governance team with your request.
          </p>
          <p>
            <strong>Current chosen name:</strong> {currentChosenName || "Not set"}
          </p>
        </div>

        <div className={styles["email-template"]}>
          <h3>Email Template</h3>
          <p>You can use the following template for your email:</p>
          <pre className={styles["template-text"]}>
            {emailBody.replace("[Your current chosen name]", currentChosenName || "Not set")}
          </pre>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>

          <Button
            as="a"
            href={`mailto:${emailAddress}?subject=${encodedEmailSubject}&body=${encodedEmailBody}`}
            variant="primary"
          >
            Send Email
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
