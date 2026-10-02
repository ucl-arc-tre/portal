import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudies } from "@/openapi";
import { responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import styles from "./RequireStudyAccess.module.css";

type Props = {
  children: React.ReactNode;
};

// Controls access to pages that require a user to have at least one study
// IG/admin skip these checks since they can already see everything
export default function RequireStudyAccess({ children }: Props) {
  const { authInProgress, isApprovedResearcher, isAdmin, isIGStaff, isTreOpsStaff, isDshOpsStaff } = useAuth();
  const canSeeAll = isAdmin || isIGStaff || isTreOpsStaff || isDshOpsStaff;
  const shouldFetchStudies = !authInProgress && !canSeeAll && isApprovedResearcher;

  const [isLoading, setIsLoading] = useState(true);
  const [hasStudies, setHasStudies] = useState(false);

  useEffect(() => {
    if (!shouldFetchStudies) return;
    getStudies().then((response) => {
      if (!responseIsError(response) && response.data) {
        setHasStudies(response.data.length > 0);
      }
      setIsLoading(false);
    });
  }, [shouldFetchStudies]);

  if (authInProgress) return null;

  if (!canSeeAll && !isApprovedResearcher) {
    return (
      <div className={styles["fallback-message"]}>
        <h2>Complete your profile to continue</h2>
        <p>To access this page, please first set up your profile by completing the approved researcher process.</p>
        <Button href="/profile" size="large">
          Complete your profile
        </Button>
      </div>
    );
  }

  if (shouldFetchStudies && isLoading) {
    return <Loading message="Loading..." />;
  }

  if (!canSeeAll && !hasStudies) {
    return (
      <div className={styles["fallback-message"]}>
        <h2>You don&apos;t have any Studies yet</h2>
        <p>Please create or be added to a Study first.</p>

        <Button href="/studies" size="large">
          Go to Studies
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
