import { useRouter } from "next/router";
import styles from "./Breadcrumbs.module.css";
import Button from "./Button";

type BreadcrumbProps = {
  studyId?: string;
  studyTitle?: string;
  assetId?: string;
  assetTitle?: string;
};

export default function Breadcrumbs(props: BreadcrumbProps) {
  const { studyId, studyTitle, assetId, assetTitle } = props;
  const router = useRouter();

  return (
    <div className={styles.breadcrumbs}>
      {studyId && (
        <>
          <Button onClick={() => router.push("/studies")} size="small" variant="tertiary">
            Studies
          </Button>
          <span> / </span>
          {assetId ? (
            <>
              <Button
                onClick={() => router.push(`/studies/manage?studyId=${studyId}`)}
                size="small"
                variant="tertiary"
                s
              >
                {studyTitle}
              </Button>
              <span> / </span>
              <span className={styles.current}>{assetTitle}</span>
            </>
          ) : (
            <span className={styles.current}>{studyTitle}</span>
          )}
        </>
      )}
    </div>
  );
}
