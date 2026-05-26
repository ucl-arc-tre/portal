import Button from "./Button";
import styles from "./Card.module.css";

type CardProps = {
  title: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  manageUrl?: string;
  canModify?: boolean;
  isWarning?: boolean;
  deleteButton?: React.ReactNode;
};

export default function Card(props: CardProps) {
  const {
    headerContent,
    title,
    children,
    footerContent,
    manageUrl,
    canModify = false,
    isWarning,
    deleteButton,
  } = props;
  return (
    <a href={manageUrl} data-cy="entity-card">
      <div className={`${styles.card} ${isWarning ? styles.warning : ""}`}>
        <div className={styles.header}>
          <h3>{title}</h3>
          {headerContent}
        </div>
        <div className={styles.content}>{children}</div>

        <div className={styles.footer}>
          {footerContent}
          <div className={styles.actions}>
            {manageUrl && (
              <Button size="small" className={styles.manage} data-cy="manage-button">
                {canModify ? "Manage" : "View"}
              </Button>
            )}
            {deleteButton}
          </div>
        </div>
      </div>
    </a>
  );
}
