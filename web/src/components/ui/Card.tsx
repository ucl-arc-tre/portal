import { useRouter } from "next/router";
import Box from "./Box";
import Button from "./Button";
import styles from "./Card.module.css";

type CardProps = {
  key: string | number;
  title: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  manageUrl: string;
  canModify?: boolean;
  isWarning?: boolean;
  deleteButton?: React.ReactNode;
};

export default function Card(props: CardProps) {
  const {
    key,
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
  return (
    <Box isCard key={key} warning={isWarning}>
      <a href={manageUrl} data-cy="entity-card">
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {headerContent}
        </div>
        <div className={styles.content}>{children}</div>

        <div className={styles.footer}>
          {footerContent}
          <div className={styles.actions}>
            {manageUrl && (
              <Button
                onClick={() => router.push(manageUrl)}
                size="small"
                className={styles.manage}
                data-cy="manage-button"
              >
                {canModify ? "Manage" : "View"}
              </Button>
            )}
            {deleteButton}
          </div>
        </div>
      </a>
    </Box>
  );
}
