import { useId, useState } from "react";
import { Agreement, getProfileAgreementsByAgreementId, UserAgreements } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Loading from "../ui/Loading";
import Error from "../ui/Error";
import Button from "../ui/Button";
import AgreementText from "../ui/agreements/AgreementText";
import { formatDate } from "../shared/exports";
import styles from "./CertificateReupload.module.css";

export default function Agreements({ agreementsData }: { agreementsData: UserAgreements | null }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const [loaded, setLoaded] = useState<Record<string, Agreement>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agreements =
    agreementsData?.confirmed_agreements.filter((agreement) => agreement.agreement_type === "approved-researcher") ??
    [];

  const loadAgreements = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      for (const agreement of agreements) {
        if (loaded[agreement.agreement_id]) continue;
        const response = await getProfileAgreementsByAgreementId({ path: { agreementId: agreement.agreement_id } });
        if (responseIsError(response) || !response.data) {
          throw new globalThis.Error(extractErrorMessage(response));
        }
        const signedAgreement = response.data;
        setLoaded((previous) => ({ ...previous, [agreement.agreement_id]: signedAgreement }));
      }
    } catch (error) {
      setError(error instanceof globalThis.Error ? error.message : "Failed to load signed agreement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles["reupload-option"]} aria-label="Agreements">
      <h2>Agreements</h2>
      {agreements.length === 0 ? (
        <p>You have not signed the Approved Researcher Agreement.</p>
      ) : (
        <>
          {agreements.map((agreement) => (
            <p key={agreement.agreement_id}>
              Approved Researcher Agreement signed on {formatDate(agreement.confirmed_at)}.
            </p>
          ))}
          <Button
            variant="secondary"
            size="small"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => {
              setExpanded((previous) => !previous);
              if (!expanded) void loadAgreements();
            }}
          >
            {expanded ? "Hide agreement" : "View signed agreement"}
          </Button>
          <div id={contentId} hidden={!expanded} aria-busy={loading}>
            {loading && <Loading message="Loading signed agreement" size="small" />}
            {error && (
              <>
                <Error message={error} />
                <Button variant="secondary" size="small" onClick={() => void loadAgreements()}>
                  Retry
                </Button>
              </>
            )}
            {expanded &&
              agreements.map((agreement) => (
                <div key={agreement.agreement_id}>
                  <h3>Approved Researcher Agreement — signed {formatDate(agreement.confirmed_at)}</h3>
                  {loaded[agreement.agreement_id] && <AgreementText text={loaded[agreement.agreement_id].text} />}
                </div>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
