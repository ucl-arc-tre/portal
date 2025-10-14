import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import styles from "./ChosenNameChangeModal.module.css";

type ChosenNameChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentChosenName?: string;
  username?: string;
};

const emailAddress = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "arc.tre@ucl.ac.uk";
const emailSubject = "TRE Portal: Chosen Name Change Request";

export default function ChosenNameChangeModal({
  isOpen,
  onClose,
  currentChosenName,
  username,
}: ChosenNameChangeModalProps) {
  if (!isOpen) return null;

  const emailBody = `Dear UCL Information Governance,

I would like to request a change to my chosen name in the UCL ARC Services Portal.

Username: ${username || ""}
Current chosen name: ${currentChosenName || "Not set"}
Requested new chosen name: [Your desired chosen name]
Reason for change: [Optional - please provide a brief reason]

Thank you for your assistance.

Kind regards`;

  const encodedEmailBody = encodeURIComponent(emailBody);
  const encodedEmailSubject = encodeURIComponent(emailSubject);

  return (
    <Dialog setDialogOpen={onClose}>
      <div className={styles.container}>
        <h2>Request Chosen Name Change</h2>

        <div className={styles.description}>
          <p>
            To change your chosen name, please send an email to the UCL Information Governance team with your request
            (template text provided using the &apos;Create Email&apos; button below).
          </p>
          <p>
            <strong>Current chosen name:</strong> {currentChosenName || "Not set"}
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            as="a"
            href={`mailto:${emailAddress}?subject=${encodedEmailSubject}&body=${encodedEmailBody}`}
            variant="primary"
          >
            Create Email
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
