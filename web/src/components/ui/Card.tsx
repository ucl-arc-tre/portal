import { useRouter } from "next/dist/client/components/navigation";
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
  const router = useRouter();

  const CardInner = (
    <article data-cy="entity-card" className={`${styles.card} ${isWarning ? styles.warning : ""}`}>
      <div className={styles.header}>
        <h3>{title}</h3>
        {headerContent}
      </div>
      <div className={styles.content}>{children}</div>

      <div className={styles.footer}>
        {footerContent}
        {manageUrl && deleteButton && (
          <div className={styles.actions}>
            <Button
              size="small"
              className={styles.manage}
              data-cy="manage-button"
              onClick={() => router.push(manageUrl)}
            >
              {canModify ? "Manage" : "View"}
            </Button>

            {deleteButton}
          </div>
        )}
      </div>
    </article>
  );
  return manageUrl && !deleteButton ? <a href={manageUrl}>{CardInner}</a> : CardInner;
}
