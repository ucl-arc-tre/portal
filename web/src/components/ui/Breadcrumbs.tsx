import { useRouter } from "next/router";
import styles from "./Breadcrumbs.module.css";
import Button from "./Button";

type BreadcrumbProps = {
  children?: React.ReactNode;
  studyId?: string;
  studyTitle?: string;
  assetId?: string;
  assetTitle?: string;
  contractName?: string;
};

export default function Breadcrumbs(props: BreadcrumbProps) {
  const { studyId, studyTitle, assetId, assetTitle, contractName } = props;
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

              {contractName ? (
                <>
                  <Button
                    onClick={() => router.push(`/studies/manage?studyId=${studyId}&assetId=${assetId}`)}
                    size="small"
                    variant="tertiary"
                    s
                  >
                    {assetTitle}
                  </Button>
                  <span> / </span>
                  <span className={styles.current}>{contractName}</span>
                </>
              ) : (
                <span className={styles.current}>{assetTitle}</span>
              )}
            </>
          ) : (
            <span className={styles.current}>{studyTitle}</span>
          )}
        </>
      )}
    </div>
  );
}
