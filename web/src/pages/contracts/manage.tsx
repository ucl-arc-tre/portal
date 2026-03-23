import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Study, getStudiesByStudyId, Contract, getStudiesByStudyIdContractsByContractId } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageContract.module.css";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContractUploadForm from "@/components/contracts/ContractUploadForm";
import ApprovedResearcherFallback from "@/components/ui/ApprovedResearcherFallback";
import ContractObjectCard from "@/components/contracts/ContractObjectCard";
import { formatDate } from "@/components/shared/exports";

export default function ManageContractPage() {
  const router = useRouter();
  const { studyId, contractId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowUploadModal] = useState(false);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const fetchData = async (studyIdParam: string, contractIdParam: string) => {
    setLoading(true);
    setError(null);

    try {
      const [contractResponse, studyResponse] = await Promise.all([
        getStudiesByStudyIdContractsByContractId({
          path: { studyId: studyIdParam, contractId: contractIdParam },
        }),
        getStudiesByStudyId({ path: { studyId: studyIdParam } }),
      ]);

      const errorMessages = Array<string>();
      if (!contractResponse.response.ok || !contractResponse.data) {
        errorMessages.push(`Failed to load contract: ${extractErrorMessage(contractResponse)}`);
      }
      if (!studyResponse.response.ok || !studyResponse.data) {
        errorMessages.push(`Failed to load contract: ${extractErrorMessage(contractResponse)}`);
      }
      if (errorMessages.length > 0) {
        setError(errorMessages.join("\n"));
        return;
      }

      setContract(contractResponse.data!);
      setStudy(studyResponse.data!);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studyId && contractId && typeof studyId === "string" && typeof contractId === "string") {
      fetchData(studyId, contractId);
    }
  }, [studyId, contractId]);

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;
  if (loading) return <Loading />;
  if (!isApprovedResearcher) return <ApprovedResearcherFallback />;

  if (error) {
    return (
      <div className={styles.container}>
        <Title text="Error" />
        <p className={styles.error}>{error}</p>
        <Button onClick={() => router.push("/studies")} variant="secondary">
          Back to Studies
        </Button>
      </div>
    );
  }

  if (!contract || !study) {
    return (
      <div className={styles.container}>
        <Title text="Not Found" />
        <p className={styles.error}>Study or contract not found.</p>
        <Button onClick={() => router.push("/studies")} variant="secondary">
          Back to Studies
        </Button>
      </div>
    );
  }

  return (
    <>
      <MetaHead
        title={`Manage Contract: ${contract.title}`}
        description={`Manage contract details for ${contract.title}`}
      />
      <Breadcrumbs
        links={[
          {
            title: "Studies",
            url: "/studies",
          },
          {
            title: study.title,
            url: `/studies/manage?studyId=${study.id}`,
          },
          {
            title: contract.title,
            url: `/contracts/manage?studyId=${study.id}&contractId=${contract.id}`,
          },
        ]}
      />

      <div className="content">
        <div className={styles.header}>
          <Title text={`Manage Contract: ${contract.title}`} />
          <Button onClick={() => setShowUploadModal(true)} variant="primary">
            Edit
          </Button>
        </div>
        <div className={styles["info"]}>
          <div className={styles.section}>
            <h3>Contract Details</h3>
            <div className={styles.field}>
              <label>Title:</label>
              <span>{contract.title}</span>
            </div>

            <div className={styles.field}>
              <label>Signatory:</label>
              <span>{contract.organisation_signatory}</span>
            </div>

            <div className={styles.field}>
              <label>Third Party:</label>
              <span>{contract.third_party_name}</span>
            </div>

            <div className={styles.field}>
              <label>Start date:</label>
              <span>{formatDate(contract.start_date)}</span>
            </div>

            <div className={styles.field}>
              <label>End data:</label>
              <span>{formatDate(contract.third_party_name)}</span>
            </div>
          </div>
        </div>

        {contract.objects_metadata.map((obj) => (
          <ContractObjectCard
            key={obj.id}
            id={obj.id}
            contractId={contract.id}
            studyId={study.id}
            filename={obj.filename}
            created_at={formatDate(obj.created_at)}
          />
        ))}

        {showEditModal && (
          <ContractUploadForm
            study={study}
            onClose={() => {
              setShowUploadModal(false);
            }}
            onSuccess={() => {
              setShowUploadModal(false);
              fetchData(study.id, contract.id);
            }} // todo
            editingContract={contract}
          />
        )}
      </div>
    </>
  );
}
