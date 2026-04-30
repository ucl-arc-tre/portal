import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import {
  Study,
  getStudiesByStudyId,
  Contract,
  getStudiesByStudyIdContractsByContractId,
  deleteStudiesByStudyIdContractsByContractId,
} from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study?.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study?.additional_study_admin_usernames.includes(userData?.username)) || false;
  const canModify = isStudyOwner || isStudyAdmin;

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const handleContractDelete = async () => {
    if (!study || !contract) return;

    setIsDeleting(true);
    setDeleteError(null);

    const response = await deleteStudiesByStudyIdContractsByContractId({
      path: { studyId: study.id, contractId: contract.id },
    });

    setIsDeleting(false);

    if (!response.response.ok) {
      const errorMsg = extractErrorMessage(response);
      setDeleteError(`Delete failed: ${errorMsg}`);
      return;
    }

    router.push(`/studies/manage?studyId=${study.id}`);
  };

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
        errorMessages.push(`Failed to load study: ${extractErrorMessage(studyResponse)}`);
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
          {canModify && (
            <div className={styles["header-actions"]}>
              <Button onClick={() => setShowUploadModal(true)} variant="primary" cy="contract-edit">
                Edit
              </Button>

              <Button onClick={() => setShowDeleteModal(true)} className="delete-button" cy="contract-delete">
                Delete Contract
              </Button>
            </div>
          )}
        </div>

        <div className={styles.info}>
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

            {contract.other_signatories && (
              <div className={styles.field}>
                <label>Other Signatories:</label>
                <span>{contract.other_signatories}</span>
              </div>
            )}

            {contract.start_date && (
              <div className={styles.field}>
                <label>Start date:</label>
                <span>{formatDate(contract.start_date)}</span>
              </div>
            )}

            {contract.expiry_date && (
              <div className={styles.field}>
                <label>Expiry date:</label>
                <span>{formatDate(contract.expiry_date)}</span>
              </div>
            )}
          </div>
        </div>

        {contract.objects_metadata.map((obj) => (
          <ContractObjectCard
            key={obj.id}
            id={obj.id}
            contractId={contract.id}
            studyId={study.id}
            filename={obj.filename}
            createdAt={formatDate(obj.created_at)}
            canModify={canModify}
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
            }}
            editingContract={contract}
          />
        )}

        {showDeleteModal && (
          <ConfirmDeleteModal
            title="Delete Contract"
            message={
              contract.objects_metadata.length > 0
                ? `This contract has ${contract.objects_metadata.length} attached file(s) which will also be deleted. Are you sure you want to delete this contract and its attached file(s)? This operation cannot be undone.`
                : "Are you sure you want to delete this contract? This operation cannot be undone."
            }
            onConfirm={handleContractDelete}
            onCancel={() => setShowDeleteModal(false)}
            isDeleting={isDeleting}
            error={deleteError}
          />
        )}
      </div>
    </>
  );
}
