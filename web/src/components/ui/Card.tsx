import { useRouter } from "next/router";
import Box from "./Box";
import Button from "./Button";
import styles from "./Card.module.css";

type EntityCardProps = {
  key: string | number;
  header: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  manageUrl: string;
  canModify?: boolean;
};

export default function EntityCard(props: EntityCardProps) {
  const { key, header, children, footerContent, manageUrl, canModify = false } = props;
  const router = useRouter();
  return (
    <Box isCard key={key}>
      <a href={manageUrl}>
        {header ? <div className={styles.header}>{header}</div> : null}
        <div className={styles.content}>{children}</div>

        <div className={styles.footer}>
          {footerContent && footerContent}
          {manageUrl && (
            <Button onClick={() => router.push(manageUrl)} size="small">
              {canModify ? "Manage" : "View"}
            </Button>
          )}
        </div>
      </a>
    </Box>
  );
}
